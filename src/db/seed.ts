import * as dotenv from 'dotenv';
import pool from './pool';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

dotenv.config();

async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    logger.info('Starting database seeding...');

    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(
      `INSERT INTO users (email, password_hash, username, role) VALUES
        ($1, $2, 'admin_user', 'admin'),
        ($3, $2, 'jonas_rasytojas', 'author'),
        ($4, $2, 'agne_autorius', 'author'),
        ($5, $2, 'petras_skaitytojas', 'user'),
        ($6, $2, 'marija_skaitytoja', 'user')
      RETURNING id`,
      [
        'admin@skaitomanas.lt',
        passwordHash,
        'jonas@example.lt',
        'agne@example.lt',
        'petras@example.lt',
        'marija@example.lt',
      ]
    );

    const [_admin, jonas, agne, petras, marija] = usersResult.rows.map((r) => r.id);

    const booksResult = await client.query(
      `INSERT INTO books (title, description, author_id, language, tags, status) VALUES
        ('Vasaros Nuotykiai', 'Jaudinanti istorija apie vasaros nuotykius prie jūros', $1, 'lt', ARRAY['nuotykiai', 'vasara', 'draugystė'], 'published'),
        ('Slaptasis Sodas', 'Paslaptinga istorija apie paslėptą sodą senamiestyje', $1, 'lt', ARRAY['paslaptis', 'fantastika'], 'published'),
        ('Meilės Labirintas', 'Romantiška drama apie sudėtingus jausmus', $2, 'lt', ARRAY['meilė', 'drama'], 'published'),
        ('Žvaigždžių Kelias', 'Mokslinės fantastikos apsakymas apie kelionę į kosmosą', $2, 'lt', ARRAY['sci-fi', 'kosmosas'], 'published'),
        ('Lietaus Simfonija', 'Poetiška istorija apie lietų ir prisiminimuos', $1, 'lt', ARRAY['poezija', 'emocijos'], 'published'),
        ('Miesto Šešėliai', 'Detektyvinė istorija apie nusikaltimus Vilniuje', $2, 'lt', ARRAY['detektyvas', 'trileris'], 'published'),
        ('Rudens Lapai', 'Trumpų apsakymų rinkinys apie rudenį', $1, 'lt', ARRAY['apsakymai', 'ruduo'], 'published'),
        ('Paskutinis Karžygys', 'Fantastinė epopėja apie paskutinį karžygį', $2, 'lt', ARRAY['fantasy', 'nuotykiai'], 'published'),
        ('Tylus Balsas', 'Psichologinis trileris apie vidinę kovą', $1, 'lt', ARRAY['trileris', 'psichologija'], 'draft'),
        ('Atminties Fragmentai', 'Eksperimentinė proza apie atmintį', $2, 'lt', ARRAY['eksperimentas', 'filosofija'], 'draft')
      RETURNING id`,
      [jonas, agne]
    );

    const bookIds = booksResult.rows.map((r) => r.id);

    for (let i = 0; i < bookIds.length; i++) {
      const bookId = bookIds[i];
      const chaptersCount = i < 5 ? 3 : 2;

      for (let j = 1; j <= chaptersCount; j++) {
        await client.query(
          `INSERT INTO chapters (book_id, title, content, chapter_number, is_published) VALUES
            ($1, $2, $3, $4, true)`,
          [
            bookId,
            `Skyrius ${j}`,
            `Čia yra ${j}-ojo skyriaus turinys knygai. Labai įdomus ir intriguojantis tekstas, kuris verčia skaitytoją skaityti toliau. Istorija rutuliojasi įdomiai, personažai yra gyvi ir tikroviški. Autorius sugebėjo perteikti emocijas ir sukurti įtampą. Kiekvienas sakinys yra kruopščiai parašytas ir turi prasmę. Skaitytojas negali atsitraukti nuo teksto ir nori sužinoti, kas bus toliau.`,
            j,
          ]
        );
      }
    }

    const chaptersResult = await client.query('SELECT id FROM chapters LIMIT 20');
    const chapterIds = chaptersResult.rows.map((r) => r.id);

    for (let i = 0; i < 30; i++) {
      const userId = i % 2 === 0 ? petras : marija;
      const chapterId = chapterIds[i % chapterIds.length];
      await client.query(
        `INSERT INTO comments (chapter_id, user_id, content) VALUES ($1, $2, $3)`,
        [chapterId, userId, `Puikus skyrius! Labai patiko. Nr. ${i + 1}`]
      );
    }

    await client.query(
      `INSERT INTO collections (user_id, book_id) VALUES
        ($1, $2), ($1, $3), ($1, $4),
        ($5, $2), ($5, $6), ($5, $7)`,
      [petras, bookIds[0], bookIds[1], bookIds[2], marija, bookIds[3], bookIds[4]]
    );

    for (let i = 0; i < 15; i++) {
      const userId = i % 2 === 0 ? petras : marija;
      const chapterId = chapterIds[i % chapterIds.length];
      const bookId = bookIds[i % 5];
      await client.query(
        `INSERT INTO reading_history (user_id, chapter_id, book_id, progress_percentage) VALUES ($1, $2, $3, $4)`,
        [userId, chapterId, bookId, Math.floor(Math.random() * 100)]
      );
    }

    await client.query('COMMIT');
    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error({ error }, 'Seeding failed');
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();

