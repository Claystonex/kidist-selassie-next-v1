-- Check Joshua Chapter 4 structure
SELECT 
  b.id as book_id,
  b.name as book_name,
  b.slug as book_slug,
  c.id as chapter_id,
  c.number as chapter_number,
  v.id as verse_id,
  v.number as verse_number,
  v.text as verse_text
FROM "Book" b
JOIN "Chapter" c ON c.book_id = b.id 
JOIN "Verse" v ON v.chapter_id = c.id
WHERE b.slug = 'joshua' AND c.number = 4
ORDER BY v.number ASC
LIMIT 20;
