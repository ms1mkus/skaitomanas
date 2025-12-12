DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('guest', 'user', 'author', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_status') THEN
        CREATE TYPE book_status AS ENUM ('draft', 'published');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  language VARCHAR(50) NOT NULL DEFAULT 'lt',
  tags TEXT[] DEFAULT '{}',
  status book_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN(tags);

CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(book_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_chapter_number ON chapters(chapter_number);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_chapter_id ON comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_book_id ON collections(book_id);

CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_book_id ON reading_history(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history(last_read_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
