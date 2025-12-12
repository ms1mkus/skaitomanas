export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  author_id: string;
  cover_image_url?: string;
  language: string;
  tags: string[];
  status: 'draft' | 'published';
  created_at: Date;
  updated_at: Date;
}

export interface Chapter {
  id: string;
  book_id: string;
  title: string;
  content: string;
  chapter_number: number;
  word_count: number;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  chapter_id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface Collection {
  id: string;
  user_id: string;
  book_id: string;
  created_at: Date;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  chapter_id: string;
  book_id: string;
  last_read_at: Date;
  pages_read: number;
}

export interface BookWithAuthor extends Book {
  author_username: string;
  author_email: string;
}

export interface ChapterWithBook extends Chapter {
  book_title: string;
}

export interface CommentWithUser extends Comment {
  username: string;
}

export interface AuthorStats {
  total_books: number;
  total_chapters: number;
  total_readers: number;
  total_comments: number;
  most_read_book?: {
    id: string;
    title: string;
    read_count: number;
  };
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}
