import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Prisma Seed Script for Ethiopian Bible Content
 * 
 * This script populates the database with actual Ethiopian Bible verses.
 * It's structured to make it easy to add more books and chapters over time.
 */
// Split combined bilingual verse text: "<Amharic> (<English>)"
function splitBilingualText(
  combined: unknown
): { amharic: string | null; english: string | null } {
  if (typeof combined !== 'string') return { amharic: null, english: null };
  const m = combined.match(/^(.*?)\s*\((.+?)\)\s*$/);
  if (m && m[1] != null && m[2] != null) {
    return { amharic: m[1].trim(), english: m[2].trim() };
  }
  return { amharic: combined.trim(), english: null };
}
async function main() {
  console.log('Starting Ethiopian Bible seeding...');

  try {
    // ============================
    // SEED BOOK OF JOSHUA
    // ============================
    const joshuaBook = await prisma.book.upsert({
      where: { slug: 'joshua' },
      update: { name: 'Joshua' },
      create: {
        name: 'Joshua',
        slug: 'joshua',
      },
    });
    
    console.log(`Book created/updated: ${joshuaBook.name} (ID: ${joshuaBook.id})`);

    // Create Chapter 4 of Joshua
    // First check if the chapter exists
    let joshuaChapter4 = await prisma.chapter.findFirst({
      where: {
        bookId: joshuaBook.id,
        number: 4
      }
    });

    // Create the chapter if it doesn't exist
    if (!joshuaChapter4) {
      joshuaChapter4 = await prisma.chapter.create({
        data: {
          number: 4,
          bookId: joshuaBook.id,
        },
      });
      console.log(`Created new chapter: Joshua ${joshuaChapter4.number}`);
    } else {
      console.log(`Found existing chapter: Joshua ${joshuaChapter4.number}`);
    }

    // Delete any existing verses to avoid duplicates
    const deletedVerses = await prisma.verse.deleteMany({
      where: { chapterId: joshuaChapter4.id },
    });
    
    if (deletedVerses.count > 0) {
      console.log(`Deleted ${deletedVerses.count} existing verses from Joshua Chapter 4`);
    }

    // Add verses for Joshua Chapter 4
    const joshua4Verses = [
      {
        number: 1,
        text: "ሕዝቡም ሁሉ ዮርዳኖስን ከተሻገሩ በኋላ፥ እግዚአብሔር ኢያሱን አለው። (And it came to pass, when all the people were clean passed over Jordan, that the LORD spake unto Joshua, saying,)"
      },
      {
        number: 2,
        text: "ከሕዝቡ አሥራ ሁለት ሰዎች ከየነገዱ አንድ አንድ ሰው ምረጥ፤ (Take you twelve men out of the people, out of every tribe a man,)"
      },
      {
        number: 3,
        text: "እነርሱንም እንዲህ ብለህ እዘዛቸው፦ ከዚህ ከዮርዳኖስ መካከል ከካህናቱ እግር ከቆመበት ስፍራ አሥራ ሁለት ድንጋዮች ውሰዱ፥ ከእናንተም ጋር አድርጉ፥ ዛሬም ማታ በምታድሩበት ቤት አኑሯቸው። (And command ye them, saying, Take you hence out of the midst of Jordan, out of the place where the priests' feet stood firm, twelve stones, and ye shall carry them over with you, and leave them in the lodging place, where ye shall lodge this night.)"
      },
      {
        number: 4,
        text: "ኢያሱም ከእስራኤል ልጆች ከየነገድ አንድ አንድ ሰው ያዘጋጃቸውን አሥራ ሁለት ሰዎች ጠራ። (Then Joshua called the twelve men, whom he had prepared of the children of Israel, out of every tribe a man:)"
      },
      {
        number: 5,
        text: "ኢያሱም አላቸው፦ ወደ አምላካችሁ ወደ እግዚአብሔር ታቦት ፊት ወደ ዮርዳኖስ መካከል እለፉ፥ እያንዳንዱም ከእናንተ እንደ እስራኤል ልጆች ነገድ ቍጥር በትከሻው አንድ አንድ ድንጋይ ያንሣ፤ (And Joshua said unto them, Pass over before the ark of the LORD your God into the midst of Jordan, and take ye up every man of you a stone upon his shoulder, according unto the number of the tribes of the children of Israel:)"
      },
      {
        number: 6,
        text: "ይህም በእናንተ መካከል ምልክት ይሁን፥ ልጆቻችሁም ወደ ፊት፦ እነዚህ ድንጋዮች ምንድር ናቸው? ብለው ቢጠይቁ፥ (That this may be a sign among you, that when your children ask their fathers in time to come, saying, What mean ye by these stones?)"
      },
      {
        number: 7,
        text: "እናንተ። የእግዚአብሔር ቃል ኪዳን ታቦት ዮርዳኖስን ሲሻገር የዮርዳኖስ ውኃ ተቆረጠ፤ እነዚህም ድንጋዮች ለእስራኤል ልጆች ለዘላለም መታሰቢያ ናቸው ትሉአቸዋላችሁ። (Then ye shall answer them, That the waters of Jordan were cut off before the ark of the covenant of the LORD; when it passed over Jordan, the waters of Jordan were cut off: and these stones shall be for a memorial unto the children of Israel for ever.)"
      },
      {
        number: 8,
        text: "የእስራኤልም ልጆች እንደ ኢያሱ ትእዛዝ አደረጉ፥ እግዚአብሔርም ለኢያሱ እንዳለው፥ እንደ እስራኤል ልጆች ነገድ ቍጥር አሥራ ሁለት ድንጋዮች ከዮርዳኖስ መካከል አነሡ፥ እንደ እግዚአብሔርም ለኢያሱ ያለው ቃል ከእነርሱ ጋር አድርገው ወደሚያድሩበት አመጡ፥ በዚያም አኖሩአቸው። (And the children of Israel did so as Joshua commanded, and took up twelve stones out of the midst of Jordan, as the LORD spake unto Joshua, according to the number of the tribes of the children of Israel, and carried them over with them unto the place where they lodged, and laid them down there.)"
      },
      {
        number: 9,
        text: "ኢያሱም የኪዳኑ ታቦት ተሸካሚዎች የካህናት እግር ቆመበት ከዮርዳኖስ መካከል አሥራ ሁለት ድንጋዮች መሠረተ፤ እስከ ዛሬም ድረስ በዚያ አሉ። (And Joshua set up twelve stones in the midst of Jordan, in the place where the feet of the priests which bare the ark of the covenant stood: and they are there unto this day.)"
      },
      {
        number: 10,
        text: "ታቦቱን የሚሸከሙ ካህናት ደግሞ እግዚአብሔር ኢያሱ ሕዝቡን ነገር ዘንድ ያዘዘውን ሁሉ እስኪወግድ ድረስ፥ እንደ ሙሴ ለኢያሱ ያዘዘው ሁሉ፥ በዮርዳኖስ መካከል ቆመው ነበር፤ ሕዝቡም ፈጥነው ተሻገሩ። (For the priests which bare the ark stood in the midst of Jordan, until everything was finished that the LORD commanded Joshua to speak unto the people, according to all that Moses commanded Joshua: and the people hasted and passed over.)"
      },
      {
        number: 11,
        text: "ሕዝቡም ሁሉ ከተሻገረ በኋላ የእግዚአብሔር ታቦትና ካህናቱ በሕዝቡ ፊት ተሻገሩ። (And it came to pass, when all the people were clean passed over, that the ark of the LORD passed over, and the priests, in the presence of the people.)"
      }
    ];

    // Insert all verses in batch
    const createdVerses = await Promise.all(
      joshua4Verses.map((verse) => {
        const { amharic, english } = splitBilingualText(verse.text);
        // Cast data to any in case Prisma client types are stale locally
        const data: any = {
          number: verse.number,
          text: verse.text,
          textAm: amharic,
          textEn: english,
          chapterId: joshuaChapter4.id,
        };
        return prisma.verse.create({ data });
      })
    );

    console.log(`Added ${createdVerses.length} verses to Joshua Chapter 4`);

    // ============================
    // TEMPLATE FOR ADDING MORE BOOKS
    // ============================
    // To add more books, follow this pattern:
    /*
    // Create or update the book
    const newBook = await prisma.book.upsert({
      where: { slug: 'book-slug' },
      update: { name: 'Book Name' },
      create: {
        name: 'Book Name',
        slug: 'book-slug',
      },
    });

    // Create a chapter
    const chapter = await prisma.chapter.upsert({
      where: { 
        // Since the bookId_number compound unique constraint may not exist,
        // we use findFirst and create instead
        id: 0 // This won't match any record and forces upsert to go to the create path
      },
      update: {},
      create: {
        number: 1,
        bookId: newBook.id,
      },
    });

    // Delete existing verses
    await prisma.verse.deleteMany({
      where: { chapterId: chapter.id },
    });

    // Add verses
    const verses = [
      { number: 1, text: "The verse text in Amharic and English" },
      // ... more verses
    ];

    await Promise.all(
      verses.map(verse => 
        prisma.verse.create({
          data: {
            number: verse.number,
            text: verse.text,
            chapterId: chapter.id,
          },
        })
      )
    );
    */

    console.log('Ethiopian Bible seeding completed successfully');
  } catch (error) {
    console.error('Error seeding Bible data:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
