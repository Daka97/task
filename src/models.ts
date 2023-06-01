//predefined interfaces
export interface User {
  id: number;
  email: string;
  password: string;
  posts: Post[];
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
}
