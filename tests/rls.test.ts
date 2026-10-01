import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222",
  p = "33333333-3333-4333-8333-333333333333";
test("migration, draft seed and RLS enforce actual database access", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values ('${a}'),('${b}');create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;grant usage on schema auth to anon,authenticated;grant execute on all functions in schema auth to anon,authenticated;`,
    );
    const file = readdirSync("supabase/migrations").find((x) =>
      x.endsWith("_initial_fabric_catalog.sql"),
    )!;
    await db.exec(readFileSync("supabase/migrations/" + file, "utf8"));
    await db.exec(readFileSync("supabase/seed.sql", "utf8"));
    const result = await db.query<{ count: number }>(
      "select count(*)::int as count from products",
    );
    assert.equal(result.rows[0].count, 60);
    await db.exec(`set role anon;`);
    assert.equal((await db.query("select * from evidence")).rows.length, 0);
    assert.equal((await db.query("select * from products")).rows.length, 0);
    await assert.rejects(
      db.query(
        "insert into posts(user_id,nickname,title,body,category) values ('" +
          a +
          "','부모','제목 세 글자','내용은 열 글자 이상입니다','일상')",
      ),
    );
    await db.exec(
      `reset role;update evidence set status='published' where id='E01';update products set status='published' where id='P002';set role anon;`,
    );
    assert.equal(
      (await db.query("select * from search_products('하튜',null,null)")).rows
        .length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select * from search_products('하튜','cotton-blend',null)",
        )
      ).rows.length,
      0,
    );
    assert.equal((await db.query("select * from evidence")).rows.length, 1);
    await db.exec(
      `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${a}',false);`,
    );
    await db.exec(
      `insert into profiles values ('${a}','첫 부모');insert into posts(id,user_id,nickname,title,body,category) values ('${p}','${a}','첫 부모','아기옷 이야기','실제로 입어본 아기옷 이야기입니다','아기옷');`,
    );
    await assert.rejects(
      db.exec(
        `insert into posts(user_id,nickname,title,body,category) values ('${b}','다른 부모','다른 사람인 척','다른 사람으로 작성할 수 없습니다','일상')`,
      ),
    );
    await assert.rejects(
      db.exec(`update posts set user_id='${b}' where id='${p}'`),
    );
    await db.exec(
      `select set_config('request.jwt.claim.sub','${b}',false);insert into profiles values ('${b}','두번째 부모');`,
    );
    assert.equal((await db.query("select * from profiles")).rows.length, 1);
    const update = await db.query(
      `update posts set title='타인이 바꾼 글' where id='${p}' returning id`,
    );
    assert.equal(update.rows.length, 0);
    assert.equal(
      (
        await db.query(
          "update evidence set status='published' where id='E02' returning id",
        )
      ).rows.length,
      0,
    );
    await db.exec(
      `select set_config('request.jwt.claims','{"user_metadata":{"role":"admin"}}',false);`,
    );
    assert.equal((await db.query("select * from evidence")).rows.length, 1);
    await db.exec(
      `select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false);update posts set status='hidden' where id='${p}';`,
    );
    assert.equal((await db.query("select * from evidence")).rows.length, 22);
    await db.exec(
      `select set_config('request.jwt.claims','{}',false);select set_config('request.jwt.claim.sub','${a}',false);`,
    );
    assert.equal(
      (await db.query(`select * from posts where id='${p}'`)).rows.length,
      0,
    );
    assert.equal(
      (
        await db.query(
          `update posts set status='published' where id='${p}' returning id`,
        )
      ).rows.length,
      0,
    );
    await assert.rejects(
      db.exec(
        `insert into comments(post_id,user_id,nickname,body) values ('${p}','${a}','첫 부모','숨긴 글의 댓글')`,
      ),
    );
    await db.exec(
      `select set_config('request.jwt.claims','{"is_anonymous":true}',false);`,
    );
    await assert.rejects(
      db.exec(
        `insert into posts(user_id,nickname,title,body,category) values ('${a}','첫 부모','익명 인증 글','익명 인증 계정으로 작성하는 글','일상')`,
      ),
    );
  } finally {
    await db.close();
  }
});
