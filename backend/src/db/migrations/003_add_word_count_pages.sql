ALTER TABLE chapters ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

ALTER TABLE reading_history RENAME COLUMN progress_percentage TO pages_read;

UPDATE chapters SET word_count = array_length(regexp_split_to_array(content, E'\\s+'), 1) WHERE word_count = 0 OR word_count IS NULL;
