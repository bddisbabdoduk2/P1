export type Visibility = "draft" | "published";
export interface Fabric {
  id: string;
  name: string;
  definition: string;
  source_ids: string[];
  summary: string;
  limitation: string;
  image: string | null;
  image_credit: string;
  image_url: string;
  image_rights: string;
  checked_at: string;
  status: string;
}
export interface Evidence {
  id: string;
  title: string;
  url: string;
  kind: string;
  publication: string;
  finding: string;
  limitation: string;
  access: string;
  checked_at: string;
  status: string;
}
export interface Product {
  id: string;
  brand: string;
  title: string;
  category: string;
  material: string;
  size: string;
  country: string;
  price: string;
  kc: string;
  stock: string;
  note: string;
  url: string;
  image: string | null;
  image_rights: string;
  fabric_ids: string[];
  checked_at: string;
  verification_status: string;
  status: string;
}
export interface Post {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  body: string;
  category: string;
  status: string;
  created_at: string;
}
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  nickname: string;
  body: string;
  status: string;
  created_at: string;
}
