
export interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  profile_id?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
  };
}

export interface PostFormData {
  title: string;
  content: string;
}
