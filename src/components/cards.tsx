import Link from "next/link";
import Image from "next/image";
import { showReviewImages } from "@/lib/config";
import type { Fabric, Product, Evidence } from "@/lib/types";
export function Photo({
  src,
  alt,
  rights,
}: {
  src: string | null;
  alt: string;
  rights: string;
}) {
  return src && (rights === "cleared" || showReviewImages) ? (
    <div className="photo">
      <Image src={src} alt={alt} fill sizes="(max-width:700px) 100vw, 33vw" />
    </div>
  ) : (
    <div className="photo placeholder">
      <span>소재·표시사항 확인</span>
    </div>
  );
}
export function FabricCard({ fabric: f }: { fabric: Fabric }) {
  return (
    <article className="card">
      <Link href={`/fabrics/${f.id}`}>
        <Photo
          src={f.image}
          alt={`${f.name} 원단 예시`}
          rights={f.image_rights}
        />
        <div className="card-body">
          <span className="eyebrow">FABRIC LIBRARY</span>
          <h3>{f.name}</h3>
          <p>{f.definition}</p>
          <span className="text-link">근거와 한계 확인</span>
        </div>
      </Link>
    </article>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="card">
      <Link href={`/products/${p.id}`}>
        <Photo src={p.image} alt={p.title} rights={p.image_rights} />
        <div className="card-body">
          <span className="tag">{p.brand}</span>
          <h3>{p.title}</h3>
          <p>{p.material || "소재 확인 필요"}</p>
          <small>
            {p.verification_status} · {p.checked_at}
          </small>
        </div>
      </Link>
    </article>
  );
}
export function EvidenceCard({ evidence: e }: { evidence: Evidence }) {
  return (
    <article className="reading">
      <span className="tag">
        {e.kind} · {e.publication}
      </span>
      <h3>
        <Link href={`/evidence/${e.id}`}>{e.title}</Link>
      </h3>
      <p>{e.finding}</p>
      <p className="muted">한계: {e.limitation}</p>
      <small>
        확인 {e.checked_at} · {e.access}
      </small>
    </article>
  );
}
