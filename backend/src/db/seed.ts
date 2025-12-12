import * as dotenv from 'dotenv';
import pool from './pool';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

dotenv.config();

function calculateWordCount(content: string): number {
  if (!content) return 0;
  return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).filter(w => w.length > 0).length;
}

async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    logger.info('Starting database seeding...');

    await client.query('BEGIN');

    await client.query('TRUNCATE TABLE refresh_tokens, reading_history, collections, comments, chapters, books, users RESTART IDENTITY CASCADE');

    const passwordHash = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(
      `INSERT INTO users (email, password_hash, username, role) VALUES
                ($1, $2, 'administratorius', 'admin'),
                ($3, $2, 'kristijonas_donelaitis', 'author'),
                ($4, $2, 'jonas_biliunas', 'author'),
                ($5, $2, 'vincas_kreve', 'author'),
                ($6, $2, 'balys_sruoga', 'author'),
                ($7, $2, 'zemaite', 'author'),
                ($8, $2, 'petras_cvirka', 'author'),
                ($9, $2, 'skaitytojas', 'user')
            RETURNING id, username`,
      [
        'admin@skaitomanas.lt',
        passwordHash,
        'donelaitis@klasikai.lt',
        'biliunas@klasikai.lt',
        'kreve@klasikai.lt',
        'sruoga@klasikai.lt',
        'zemaite@klasikai.lt',
        'cvirka@klasikai.lt',
        'skaitytojas@skaitomanas.lt',
      ]
    );

    const users = usersResult.rows;
    const donelaitis = users.find(u => u.username === 'kristijonas_donelaitis')?.id;
    const biliunas = users.find(u => u.username === 'jonas_biliunas')?.id;
    const kreve = users.find(u => u.username === 'vincas_kreve')?.id;
    const sruoga = users.find(u => u.username === 'balys_sruoga')?.id;
    const zemaite = users.find(u => u.username === 'zemaite')?.id;
    const cvirka = users.find(u => u.username === 'petras_cvirka')?.id;
    const skaitytojas = users.find(u => u.username === 'skaitytojas')?.id;

    const booksData = [
      {
        title: 'Metai',
        description: 'Pirmasis pasaulietinis lietuvių literatūros kūrinys. Poema apie lietuvių baudžiauninkų gyvenimą, gamtos ciklą ir kaimo buitį. Kristijonas Donelaitis vaizduoja keturių metų laikų eigą ir paprastų žmonių kasdienybę.',
        author_id: donelaitis,
        language: 'lt',
        tags: ['klasika', 'poema', 'gamta', 'kaimas'],
        status: 'published',
        chapters: [
          {
            title: 'Pavasario linksmybės',
            content: `<p>Jau saulelė vėl atkopdama budino svietą,</p>
<p>Ir žiemos šaltos trūsus pargriaudama juokės;</p>
<p>Tuo giedri lakštingala tėvelį pasveikino gražiai,</p>
<p>Ir linksmas kukutis kukavo aukštybėse medelių.</p>

<p>Visa gamta bundančios pavasarį šventė,</p>
<p>Upeliai linksmi per laukus bėgo šniokšdami,</p>
<p>O vyturėlis aukštybių giesmes giedojo,</p>
<p>Ir žemė vėl sau gyvybę ėmė grąžinti.</p>

<p>Žmoneliai visi krūpsnopė iš trobų išlindo,</p>
<p>Ir visi darbai nuo ryto lig vakaro ėjos.</p>
<p>Jaučiai į laukus su arkliais bėgo džiaugdamies,</p>
<p>O mergos dainavo, prie verpsčių susėdusios.</p>`
          },
          {
            title: 'Vasaros darbai',
            content: `<p>Vasaros karštis apgaubė visą kraštelį,</p>
<p>Javai geltonuoti ėmė laukuose plačiuose,</p>
<p>O dalgės žibėjo, šienapjūtės meto sulaukus,</p>
<p>Visi žmoneliai triūsėjo nuo pat aušros.</p>

<p>Bobos ir diedai, vaikai ir jaunuoliai,</p>
<p>Visi sutartinai dirbo laukuose plačiuose.</p>
<p>Prakaitas lašėjo, bet niekas nesiskundė,</p>
<p>Nes žinojo visi – rudenį bus pilnos skrynios.</p>

<p>Vakare grįždami dainavo linksmas dainas,</p>
<p>O mėnuo jiems švietė kelią namo einantiems.</p>`
          },
          {
            title: 'Rudenio gėrybės',
            content: `<p>Ir atėjo ruduo su gėrybėmis pilnomis,</p>
<p>Obuoliai ir kriaušės, riešutai ir slyvos,</p>
<p>Bulvės iš žemės buvo renkami rūpestingai,</p>
<p>Ir kluonai pilni javų buvo sukrauti.</p>

<p>Žmoneliai dėkojo Dievui už derlių gerą,</p>
<p>Ir šventės prasidėjo po sunkių darbų.</p>
<p>Alus putojo, pyragų buvokepama,</p>
<p>Ir visi kartu linksmybes kėlė didelias.</p>`
          },
          {
            title: 'Žiemos rūpesčiai',
            content: `<p>Šaltasis žiemys apspietė visą šalelę,</p>
<p>Sniegas užklojo laukus ir miškus giliai.</p>
<p>Trobose šilta, pečiuos ugnis pleška,</p>
<p>O bobos verpia, diedai taisosi rakandus.</p>

<p>Ilgi vakarai su pasakomis praeidavo,</p>
<p>Vaikai klausydavo apie laimes ir vargus.</p>
<p>O pro langą vėjas staugė ir pustė,</p>
<p>Bet troboje buvo ramu ir jauku.</p>

<p>Taip bėgo metai, ratas sukos amžinas,</p>
<p>Gamta savo darbus atlikdavo nenuilsdama,</p>
<p>O žmoneliai ištvermingai gyveno savo būvį,</p>
<p>Tikėdami Dievu ir artimo meile.</p>`
          }
        ]
      },
      {
        title: 'Kliudžiau',
        description: 'Jaudinantis apsakymas apie vaiko ir gyvūno santykį, kaltės jausmą ir moralines pamokas. Tai vienas žinomiausių Jono Biliūno kūrinių.',
        author_id: biliunas,
        language: 'lt',
        tags: ['klasika', 'apsakymas', 'psichologija'],
        status: 'published',
        chapters: [
          {
            title: 'Kliudžiau',
            content: `<p><strong>Kliudžiau.</strong></p>

<p>Taip, aš tikrai kliudžiau.</p>

<p>Tai buvo balta katytė. Ji sėdėjo ant tvoros ir žiūrėjo į mane savo didelėmis, geltonomis akimis. Aš turėjau lanką. Tą dieną jaučiausi kaip tikras medžiotojas.</p>

<blockquote>– Kliudžiau! – sušukau aš, pamatęs, kaip strėlė įsmigo į minkštą kailiuką.</blockquote>

<p>Katytė nebejudėjo. Ji nukrito nuo tvoros į žolę. Aš pribėgau prie jos. Ji gulėjo nejudėdama, o iš jos krūtinės sunkėsi kraujas. Tik tada aš supratau, ką padariau.</p>

<p>Man pasidarė baisu. Aš norėjau būti didvyris, o tapau žudiku. Ta balta katytė niekam nieko blogo nepadarė. Ji tik šildėsi saulėje.</p>

<p>Aš verkiau. Verkiau ilgai ir graudžiai. Bet ašaromis katytės neprikelsi. Tai buvo mano pirmoji ir paskutinė medžioklė. Nuo tos dienos aš niekada daugiau neėmiau lanko į rankas.</p>

<p><em>Šis įvykis paliko gilią žaizdą mano širdyje. Aš supratau, kad gyvybė yra šventa, ir niekas neturi teisės jos atimti. Net ir mažos, baltos katytės.</em></p>`
          }
        ]
      },
      {
        title: 'Brisiaus galas',
        description: 'Graudi istorija apie seną šunį Brisių, kuris tampa nereikalingas savo šeimininkams. Kūrinys nagrinėja senatvės, ištikimybės ir nedėkingumo temas.',
        author_id: biliunas,
        language: 'lt',
        tags: ['klasika', 'apsakymas', 'gyvūnai', 'liūdesys'],
        status: 'published',
        chapters: [
          {
            title: 'Brisiaus galas',
            content: `<p>Brisius buvo senas. Labai senas. Jo akys buvo apsiblaususios, o kojos sunkiai laikė kūną. Jis visą gyvenimą ištikimai tarnavo savo šeimininkui. Saugojo namus, lojo ant svetimų, buvo geriausias draugas.</p>

<p>Bet dabar jis buvo niekam nereikalingas. Jis tik gulėjo būdoje ir sapnavo savo jaunystę. Sapnavo, kaip bėgiojo po pievas, kaip gaudė kiškius, kaip šeimininkas jį glostė.</p>

<blockquote>– Brisiau! – pašaukė šeimininkas.</blockquote>

<p>Brisius sunkiai pakėlė galvą. Ar tai jam? Ar šeimininkas jį prisiminė? Jis sukaupė paskutines jėgas ir išlindo iš būdos. Uodega vizgėjo, nors ir sunkiai.</p>

<p>Šeimininkas stovėjo su šautuvu rankose. Brisius nesuprato. Jis manė, kad jie eis į medžioklę. Kaip senais gerais laikais.</p>

<p>Bet šeimininkas pakėlė šautuvą. Brisius žiūrėjo į jį savo geromis, ištikimomis akimis. Jis vis dar vizgino uodegą.</p>

<p><strong>Pokšt!</strong></p>

<p>Ir viskas baigėsi. Brisius krito ant žemės. Jis net nesuprato, kas atsitiko. <em>Jis mirė galvodamas, kad šeimininkas jį myli.</em></p>`
          }
        ]
      },
      {
        title: 'Laimės žiburys',
        description: 'Pasaka apie jaunuolį, ieškantį laimės žiburio. Vincas Krėvė parodo lietuvių tautos dvasinę stiprybę ir tikėjimą gėriu.',
        author_id: kreve,
        language: 'lt',
        tags: ['pasaka', 'filosofija', 'lietuvių tautosaka'],
        status: 'published',
        chapters: [
          {
            title: 'Kelionės pradžia',
            content: `<p>Gyveno senovės Lietuvoje jaunuolis, vardu <strong>Jurgis</strong>. Jis buvo stiprus ir drąsus, bet jo širdyje degė troškimas – rasti Laimės žiburį, apie kurį pasakojimai sklido per kaimus.</p>

<p>Seni žmonės kalbėjo, kad kas randa Laimės žiburį, tam atsiveria visi pasaulio turtai ir laimė amžina. Bet niekas nežinojo, kur jis yra.</p>

<blockquote>– Aš jį rasiu, – tarė Jurgis savo motinai. – Ir parsivešiu laimę mūsų kaimui.</blockquote>

<p>Motina verkė, bet suprato, kad negali sulaikyti sūnaus. Ji davė jam duonos kepalą ir palaimino kelionei.</p>

<p>Ir išėjo Jurgis į platų pasaulį. Ėjo per miškus tamsius, per kalnus aukštus, per upes sraunias. Sutiko daug žmonių, kurie irgi ieškojo laimės, bet ne visi tikėjo Laimės žiburiu.</p>`
          },
          {
            title: 'Išmintis',
            content: `<p>Ilgai keliavo Jurgis. Metai prabėgo kaip dienos. Jo plaukai pražilo, o kojos pavargo. Bet jis vis ėjo pirmyn.</p>

<p>Vieną dieną sutiko jis seną išminčių, gyvenantį vienumo kalvoje.</p>

<blockquote>– Seneli, – tarė Jurgis, – ar nežinai, kur rasti Laimės žiburį?</blockquote>

<p>Išminčius šyptelėjo ir atsakė:</p>

<blockquote>– Vaikeli, Laimės žiburys nėra kažkur toli. Jis dega tavo paties širdyje. Laimė yra ne tai, ką randi, o tai, ką neši savyje – <em>meilę, gerumą, tikėjimą</em>.</blockquote>

<p>Jurgis suprato. Jis nebėgo į namus, bet ėjo ramiai, šypsodamasis. Jo širdyje degė Laimės žiburys – ir tai buvo pati didžiausia laimė.</p>`
          }
        ]
      },
      {
        title: 'Dievų miškas',
        description: 'Memuarinis romanas apie koncentracijos stovyklą Štuthofe. Balys Sruoga tragedijas aprašo su ironija ir humoru, sukurdamas unikalų literatūrinį stilių.',
        author_id: sruoga,
        language: 'lt',
        tags: ['memuarai', 'karas', 'holokaustas', 'istorija'],
        status: 'published',
        chapters: [
          {
            title: 'Įvadas į pragarą',
            content: `<p>Mus visus suvarė į vagonus kaip gyvulius. Nežinojome, kur važiuojame. Vieni manė – į darbo stovyklą. Kiti – kad grįšime namo. <strong>Niekas nenorėjo tikėti blogiausia.</strong></p>

<p>Vagone buvo tamsu ir karšta. Žmonės alpėjo, vaikai verkė. O aš galvojau apie savo namus, apie sodą, apie knygas, kurias palikau nebaigtas skaityti.</p>

<blockquote>Ar dar kada nors matysiu savo Lietuvą?</blockquote>

<p>Traukinys sustojo. Durys atsidarė. Šviesa apakino akis. Ir prasidėjo nauja gyvenimo era – <em>Dievų miškas.</em></p>`
          },
          {
            title: 'Kaliniai',
            content: `<p>Mūsų galvos buvo nuskustos. Drabužiai – dryžuoti, kaip zebrai. Vardų nebeturėjome – tik numerius.</p>

<p>Bet žmogus yra keistas padaras. Net pragare jis randa būdų išlikti žmogumi. Mes pasakojome juokus, dalijomės prisiminimais, <strong>svajojome apie laisvę</strong>.</p>

<p>Kai kurie prarado tikėjimą. Kiti jį sustiprino. Aš? Aš išmokau juoktis iš nelaimių. Tai buvo vienintelis būdas išlaikyti protą.</p>

<blockquote>Ironija – tai skydas prieš beprotybę.</blockquote>

<p>Kiekvieną dieną matydavome mirtį. Bet kiekvieną rytą vėl atsikeldavome. <em>Gyvybės instinktas stipresnis už viską.</em></p>`
          },
          {
            title: 'Viltis',
            content: `<p>Karo pabaiga artėjo. Mes girdėjome apie frontą. Sargybiniai buvo neramūs. <strong>Ar grįšime namo?</strong></p>

<p>Aš galvojau apie savo šeimą. Apie žmoną. Apie vaikus. Ar jie manęs laukia? Ar jie žino, kad aš dar gyvas?</p>

<blockquote>Viltis yra paskutinis dalykas, kurio žmogus atsisako.</blockquote>

<p>Ir vieną dieną – laisvė. Vartai atsidarė. Mes buvom laisvi. <em>Ar tikrai?</em></p>

<p>Fiziškai – taip. Bet širdyje liko randai, kurie niekada negydo. Dievų miškas visada bus su manimi. Bet aš išgyvenau. Ir apie tai turiu papasakoti pasauliui.</p>`
          }
        ]
      },
      {
        title: 'Petras Kurmelis',
        description: 'Apysaka apie paprastą lietuvišką valstiečių gyvenimą. Žemaitė su meile ir humoru vaizduoja kaimo žmones, jų rūpesčius ir džiaugsmus.',
        author_id: zemaite,
        language: 'lt',
        tags: ['klasika', 'kaimas', 'humoras', 'valstiečiai'],
        status: 'published',
        chapters: [
          {
            title: 'Petras',
            content: `<p><strong>Petras Kurmelis</strong> buvo paprastas žmogus. Dirbo žemę, augino gyvulius, gyveno kaip visi kaimo žmonės. Bet turėjo jis vieną ydą – mėgo alutį.</p>

<p>Bobela jo, Morta, visada pykdavo:</p>

<blockquote>– Petrai! Vėl girtas grįžai! Vaikai alkani, o tu pinigus pragėrei!</blockquote>

<p>Petras tik galvą nuleisdavo ir tylėdavo. Bet kitą šeštadienį vėl eidavo į karčemą.</p>

<p>Taip jie gyveno – tai pykdamiesi, tai taikydamiesi. Kaip ir visi kaimo žmonės. <em>Be to, kas kitas Petrą suprastų?</em></p>`
          },
          {
            title: 'Karčema',
            content: `<p>Karčemoje buvo linksma. Vyrai susirinkdavo vakarais, gerdavo alų ir kalbėdavosi apie visokius dalykus.</p>

<p>Petras mėgo pasakoti istorijas. Jis turėjo talentą – kiekviena jo istorija tapdavo nuotykiu.</p>

<blockquote>– Ar girdėjote, kaip aš vilką nugalėjau? – klausdavo Petras, o visi jau žinojo, kad istorija bus puiki.</blockquote>

<p>Ir niekas netikėjo, bet visi klausėsi. Nes Petras pasakojo taip, kad net netikrovė tapdavo tikra.</p>

<p><em>Tokia buvo kaimo laimė – paprasta, žemiška, tikra.</em></p>`
          }
        ]
      },
      {
        title: 'Cukriniai avinėliai',
        description: 'Petro Cvirkos įtaigus romanas apie prieškarinės Lietuvos smulkiąją buržuaziją, jų gyvenimo būdą ir moralines vertybes.',
        author_id: cvirka,
        language: 'lt',
        tags: ['romanas', 'satira', 'tarpukaris'],
        status: 'published',
        chapters: [
          {
            title: 'Miestelis',
            content: `<p>Mūsų miestelyje visi pažinojo vieni kitus. <strong>Ponas Šimkus</strong> turėjo krautuvę, <strong>ponas Kazlauskas</strong> – smuklę, o <strong>ponia Petrauskienė</strong> buvo žinoma klebonatėje.</p>

<p>Jie visi save laikė gerbiamais žmonėmis. Šventadieniais eidavo į bažnyčią, pirktinėmis rūbuose vaikštinėdavo per aikštę, o vakarais aptarinėdavo kaimynų reikalus.</p>

<blockquote>– Ar girdėjote? Jonienė nusipirko naują keptuvę! Iš kur ji pinigų turi?</blockquote>

<p>Tokios buvo jų kalbos. Tuščios ir beprasmės. Bet jiems atrodė – labai svarbios.</p>`
          },
          {
            title: 'Pretenzijos',
            content: `<p>Kiekvienas norėjo atrodyti geresnis negu buvo. <strong>Cukriniai avinėliai</strong> – taip juos vadino.</p>

<p>Iš išorės – mieli, švelnutėliai. O viduje? Pavydas, godumas, egoizmas.</p>

<blockquote>– Mes ne kokie ten kaimiečiai! Mes – inteligentai!</blockquote>

<p>Bet ką reiškia inteligencija, kai širdis tuščia? Kai kaimyno nelaimė tik džiaugsmas?</p>

<p><em>Taip gyveno mūsų miestelio „elitas". Ir taip gyvena panašūs žmonės visur ir visada.</em></p>`
          }
        ]
      }
    ];

    for (const bookData of booksData) {
      const bookResult = await client.query(
        `INSERT INTO books (title, description, author_id, language, tags, status) VALUES
                    ($1, $2, $3, $4, $5, $6)
                RETURNING id`,
        [bookData.title, bookData.description, bookData.author_id, bookData.language, bookData.tags, bookData.status]
      );
      const bookId = bookResult.rows[0].id;

      for (let i = 0; i < bookData.chapters.length; i++) {
        const chapter = bookData.chapters[i];
        const wordCount = calculateWordCount(chapter.content);
        await client.query(
          `INSERT INTO chapters (book_id, title, content, chapter_number, word_count, is_published) VALUES
                        ($1, $2, $3, $4, $5, true)`,
          [bookId, chapter.title, chapter.content, i + 1, wordCount]
        );
      }
    }

    const chaptersResult = await client.query('SELECT id FROM chapters');
    const chapterIds = chaptersResult.rows.map(r => r.id);

    const comments = [
      'Nuostabi lietuvių literatūros klasika!',
      'Šis kūrinys privertė mane susimąstyti.',
      'Labai rekomenduoju kiekvienam lietuviui.',
      'Puikus stilius ir gili prasmė.',
      'Klasika, kuri niekada nesensta.',
      'Skaičiau mokykloje, dabar skaitau iš naujo.',
      'Galingas tekstas.',
    ];

    for (const chapterId of chapterIds) {
      const numComments = Math.floor(Math.random() * 3);
      for (let i = 0; i < numComments; i++) {
        const content = comments[Math.floor(Math.random() * comments.length)];
        await client.query(
          `INSERT INTO comments (chapter_id, user_id, content) VALUES ($1, $2, $3)`,
          [chapterId, skaitytojas, content]
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
