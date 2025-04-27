'use client';

import React from 'react';
import TranslatableText from './TranslatableText';

export default function StaticVerse() {
  // Fixed verse content - John 12:9-17
  return (
    <div className="bg-[#064d32] rounded-lg p-4 shadow-md border border-[#086c47]">
      <h3 className="text-[#edcf08] font-bold text-lg mb-2">
        <TranslatableText>John 12:9-17</TranslatableText>
      </h3>
      <div className="text-white text-sm italic">
        <TranslatableText>
          Meanwhile a large crowd of Jews found out that Jesus was there and came, not only because of him but also to see Lazarus, whom he had raised from the dead. So the chief priests made plans to kill Lazarus as well, for on account of him many of the Jews were going over to Jesus and believing in him.
        </TranslatableText>
        <p className="mt-2"><TranslatableText>
          The next day the great crowd that had come for the festival heard that Jesus was on his way to Jerusalem. They took palm branches and went out to meet him, shouting, "Hosanna!" "Blessed is he who comes in the name of the Lord!" "Blessed is the king of Israel!"
        </TranslatableText></p>
        <p className="mt-2"><TranslatableText>
          Jesus found a young donkey and sat on it, as it is written: "Do not be afraid, Daughter Zion; see, your king is coming, seated on a donkey's colt." At first his disciples did not understand all this. Only after Jesus was glorified did they realize that these things had been written about him and that these things had been done to him.
        </TranslatableText></p>
      </div>
    </div>
  );
}
