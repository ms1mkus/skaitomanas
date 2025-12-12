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

    await client.query('TRUNCATE TABLE reading_history, collections, comments, chapters, books, users RESTART IDENTITY CASCADE');

    const passwordHash = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(
      `INSERT INTO users (email, password_hash, username, role) VALUES
        ($1, $2, 'admin_user', 'admin'),
        ($3, $2, 'jonas_biliunas', 'author'),
        ($4, $2, 'salomeja_neris', 'author'),
        ($5, $2, 'petras_skaitytojas', 'user'),
        ($6, $2, 'marija_skaitytoja', 'user')
      RETURNING id, username`,
      [
        'admin@skaitomanas.lt',
        passwordHash,
        'jonas@rasytojai.lt',
        'salomeja@rasytojai.lt',
        'petras@skaitytojai.lt',
        'marija@skaitytojai.lt',
      ]
    );

    const users = usersResult.rows;
    const jonas = users.find(u => u.username === 'jonas_biliunas')?.id;
    const salomeja = users.find(u => u.username === 'salomeja_neris')?.id;
    const petras = users.find(u => u.username === 'petras_skaitytojas')?.id;
    const marija = users.find(u => u.username === 'marija_skaitytoja')?.id;

    const booksData = [
      {
        title: 'Kliudžiau',
        description: 'Jaudinantis apsakymas apie vaiko ir gyvūno santykį, kaltės jausmą ir moralines pamokas. Tai vienas žinomiausių Jono Biliūno kūrinių.',
        author_id: jonas,
        language: 'lt',
        tags: ['klasika', 'lietuvių literatūra', 'apsakymas', 'drama'],
        status: 'published',
        cover_image_url: 'https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=800&q=80',
        chapters: [
          {
            title: 'Vienintelė dalis',
            content: `Kliudžiau.

Taip, aš tikrai kliudžiau.

Tai buvo balta katytė. Ji sėdėjo ant tvoros ir žiūrėjo į mane savo didelėmis, geltonomis akimis. Aš turėjau lanką. Tą dieną jaučiausi kaip tikras medžiotojas.

– Kliudžiau! – sušukau aš, pamatęs, kaip strėlė įsmigo į minkštą kailiuką.

Katytė nebejudėjo. Ji nukrito nuo tvoros į žolę. Aš pribėgau prie jos. Ji gulėjo nejudėdama, o iš jos krūtinės sunkėsi kraujas. Tik tada aš supratau, ką padariau.

Man pasidarė baisu. Aš norėjau būti didvyris, o tapau žudiku. Ta balta katytė niekam nieko blogo nepadarė. Ji tik šildėsi saulėje.

Aš verkiau. Verkiau ilgai ir graudžiai. Bet ašaromis katytės neprikelsi. Tai buvo mano pirmoji ir paskutinė medžioklė. Nuo tos dienos aš niekada daugiau neėmiau lanko į rankas.

Šis įvykis paliko gilią žaizdą mano širdyje. Aš supratau, kad gyvybė yra šventa, ir niekas neturi teisės jos atimti. Net ir mažos, baltos katytės.`
          }
        ]
      },
      {
        title: 'Brisiaus galas',
        description: 'Graudi istorija apie seną šunį Brisių, kuris tampa nereikalingas savo šeimininkams. Kūrinys nagrinėja senatvės, ištikimybės ir nedėkingumo temas.',
        author_id: jonas,
        language: 'lt',
        tags: ['klasika', 'lietuvių literatūra', 'gyvūnai', 'liūdesys'],
        status: 'published',
        cover_image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
        chapters: [
          {
            title: 'Senatvė',
            content: `Brisius buvo senas. Labai senas. Jo akys buvo apsiblaususios, o kojos sunkiai laikė kūną. Jis visą gyvenimą ištikimai tarnavo savo šeimininkui. Saugojo namus, lojo ant svetimų, buvo geriausias draugas.

Bet dabar jis buvo niekam nereikalingas. Jis tik gulėjo būdoje ir sapnavo savo jaunystę. Sapnavo, kaip bėgiojo po pievas, kaip gaudė kiškius, kaip šeimininkas jį glostė.

– Brisiau! – pašaukė šeimininkas.

Brisius sunkiai pakėlė galvą. Ar tai jam? Ar šeimininkas jį prisiminė? Jis sukaupė paskutines jėgas ir išlindo iš būdos. Uodega vizgėjo, nors ir sunkiai.

Šeimininkas stovėjo su šautuvu rankose. Brisius nesuprato. Jis manė, kad jie eis į medžioklę. Kaip senais gerais laikais.

Bet šeimininkas pakėlė šautuvą. Brisius žiūrėjo į jį savo geromis, ištikimomis akimis. Jis vis dar vizgino uodegą.

Pokšt!

Ir viskas baigėsi. Brisius krito ant žemės. Jis net nesuprato, kas atsitiko. Jis mirė galvodamas, kad šeimininkas jį myli.`
          }
        ]
      },
      {
        title: 'Eglė žalčių karalienė',
        description: 'Lietuvių liaudies pasaka apie Eglę, kuri išteka už žalčio Žilvino ir tampa jūros karaliene. Tai pasakojimas apie meilę, išdavystę ir pasiaukojimą.',
        author_id: salomeja,
        language: 'lt',
        tags: ['pasaka', 'mitologija', 'meilė', 'drama'],
        status: 'published',
        cover_image_url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80',
        chapters: [
          {
            title: 'Pažadėjimas',
            content: `Buvo vasaros vakaras. Eglė su seserimis maudėsi jūroje. Išlipusi į krantą, ji pamatė, kad į jos marškinius įsivėlęs žaltys.

– Atiduok man marškinius! – sušuko Eglė.
– Pažadėk, kad tekėsi už manęs, – prabilo žaltys žmogaus balsu.

Eglė nusijuokė. Tekėti už žalčio? Kokia nesąmonė! Bet marškinių reikėjo.
– Gerai, tekėsiu! – pasakė ji, manydama, kad tai tik pokštas.

Žaltys iššliaužė, ir Eglė apsirengė. Ji grįžo namo ir pamiršo savo pažadą.

Bet po trijų dienų kieme pasirodė daugybė žalčių. Jie atšliaužė reikalauti nuotakos. Tėvai bandė apgauti žalčius, duodami jiems žąsį, avį, karvę, bet gegutė vis išduodavo.

Galiausiai Eglė turėjo išeiti. Ji atsisveikino su tėvais, broliais ir seserimis ir iškeliavo su žalčiais į jūros dugną.`
          },
          {
            title: 'Gyvenimas jūroje',
            content: `Jūros dugne Eglę pasitiko jaunikaitis – Žilvinas. Jis buvo tas pats žaltys, tik dabar atvirstęs į žmogų. Jis buvo gražus ir geras.

Eglė pamilo Žilviną. Jie gyveno gintaro rūmuose, laimingai ir ramiai. Eglė pagimdė tris sūnus – Ąžuolą, Uosį ir Beržą, ir vieną dukrą – Drebulę.

Metai bėgo. Eglė pasiilgo savo tėviškės. Ji norėjo aplankyti tėvus. Žilvinas nenorėjo jos išleisti. Jis davė jai tris užduotis: suverpti šilko kuodelį, sunešioti geležines klumpes ir iškepti pyragą be indų.

Eglė, padedama gerosios burtininkės (arba tiesiog savo sumanumo), įveikė visas užduotis. Žilvinas turėjo ją išleisti.

– Tik nekalbėk su niekuo daugiau nei reikia, ir grįžk po devynių dienų, – prisakė jis. – Kai grįši, pašauk mane šiais žodžiais:
„Žilvinai, Žilvinėli,
Jei tu gyvas – atplauk pieno puta,
Jei tu miręs – atplauk kraujo puta.“`
          },
          {
            title: 'Išdavystė',
            content: `Eglė grįžo į tėviškę. Visi džiaugėsi ją matydami. Bet broliai nenorėjo, kad ji grįžtų pas žaltį. Jie nusprendė užmušti Žilviną.

Jie nusivedė vaikus į mišką ir kamantinėjo, kaip pašaukti tėvą. Ąžuolas, Uosis ir Beržas tylėjo kaip žemė. Bet mažoji Drebulė išsigando ir pasakė.

Broliai nuėjo prie jūros, pašaukė Žilviną ir, kai šis pasirodė, užkapojo jį dalgiais.

Eglė nieko nežinojo. Praėjo devynios dienos. Ji atėjo prie jūros ir pašaukė:
„Žilvinai, Žilvinėli...“

Ir atplaukė kraujo puta.

Eglė suprato, kas atsitiko. Iš sielvarto ji užkeikė savo vaikus ir save. Sūnus pavertė stipriais medžiais – ąžuolu, uosiu ir beržu, kad jie stovėtų tvirtai. Dukrą pavertė drebule, kad ji amžinai drebėtų iš baimės. O pati pavirto egle – tamsiu, spygliuotu medžiu.`
          }
        ]
      },
      {
        title: 'Dienoraštis be datų',
        description: 'Modernus romanas apie jauno žmogaus paieškas dideliame mieste. Meilė, karjera, vienatvė ir prasmės ieškojimas.',
        author_id: salomeja,
        language: 'lt',
        tags: ['romanas', 'šiuolaikinė literatūra', 'miestas'],
        status: 'published',
        cover_image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
        chapters: [
          {
            title: 'Pirmadienis',
            content: `Nekenčiu pirmadienių. Žadintuvas skamba 6:30. Tamsa už lango. Kava. Autobusas. Darbas.

Visi kažkur skuba. Veidai pilki, akys įbestos į telefonus. Aš esu vienas iš jų.

Darbe tas pats. Ataskaitos, susirinkimai, dirbtinės šypsenos. "Kaip savaitgalis?" - klausia kolega, kuriam visiškai nerūpi mano savaitgalis. "Gerai," - atsakau aš, nors visą savaitgalį gulėjau lovoje ir žiūrėjau serialus.

Vakare einu į barą. Susitinku su draugais. Kalbame apie nieką. Juokiamės iš tų pačių senų juokelių. Jaučiuosi tuščias.

Ar tai ir yra gyvenimas? Ar to aš norėjau, kai buvau vaikas?`
          },
          {
            title: 'Susitikimas',
            content: `Šiandien ją pamačiau. Ji sėdėjo parke ant suoliuko ir skaitė knygą. Vėjas žaidė jos plaukais. Ji atrodė tokia rami, tokia... tikra.

Aš priėjau.
– Ką skaitai? – paklausiau.
Ji pakėlė akis. Jos buvo žalios.
– Murakami, – atsakė ji ir nusišypsojo.

Mes kalbėjomės valandų valandas. Apie knygas, apie muziką, apie svajones. Pasirodo, ji irgi jaučiasi pasiklydusi šiame mieste. Ji irgi ieško kažko daugiau.

Staiga pasaulis nušvito spalvomis. Pirmadienis nebeatrodė toks baisus.`
          }
        ]
      }
    ];

    for (const bookData of booksData) {
      const bookResult = await client.query(
        `INSERT INTO books (title, description, author_id, language, tags, status, cover_image_url) VALUES
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id`,
        [bookData.title, bookData.description, bookData.author_id, bookData.language, bookData.tags, bookData.status, bookData.cover_image_url]
      );
      const bookId = bookResult.rows[0].id;

      for (let i = 0; i < bookData.chapters.length; i++) {
        const chapter = bookData.chapters[i];
        await client.query(
          `INSERT INTO chapters (book_id, title, content, chapter_number, is_published) VALUES
            ($1, $2, $3, $4, true)`,
          [bookId, chapter.title, chapter.content, i + 1]
        );
      }
    }

    const chaptersResult = await client.query('SELECT id FROM chapters');
    const chapterIds = chaptersResult.rows.map(r => r.id);

    const comments = [
      'Nuostabi istorija!',
      'Labai patiko, ačiū autoriui.',
      'Verčia susimąstyti...',
      'Laukiu tęsinio!',
      'Šiek tiek liūdna, bet gražu.',
      'Geriausia knyga, kurią skaičiau šiais metais.',
      'Rekomenduoju visiems.',
      'Klasika yra klasika.',
    ];

    for (const chapterId of chapterIds) {
      const numComments = Math.floor(Math.random() * 4);
      for (let i = 0; i < numComments; i++) {
        const userId = Math.random() > 0.5 ? petras : marija;
        const content = comments[Math.floor(Math.random() * comments.length)];
        await client.query(
          `INSERT INTO comments (chapter_id, user_id, content) VALUES ($1, $2, $3)`,
          [chapterId, userId, content]
        );
      }
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

void seed();
