import { createReadStream, readdirSync } from 'fs';
import { join } from 'path';
import { parse, map, filter, NodeCue, formatTimestamp } from 'subtitle';
import { toValidAmulet } from './amulet';

async function main() {
  const streams = readdirSync('./subs')
    .filter((filename) => filename.endsWith('.srt'))
    .map((filename) => {
      return createReadStream(join('./subs', filename))
        .pipe(parse())
        .pipe(filter((node) => node.type === 'cue'))
        .pipe(filter((node) => !!toValidAmulet((node as NodeCue).data.text)))
        .pipe(
          map((node) => {
            const start = formatTimestamp((node as NodeCue).data.start, { format: 'WebVTT' });
            const end = formatTimestamp((node as NodeCue).data.end, { format: 'WebVTT' });
            return {
              amulet: (node as NodeCue).data.text,
              title: `${filename} // ${start}—${end}`,
            };
          }),
        );
    });

  await Promise.allSettled(
    streams.map(
      (stream) =>
        new Promise((resolve, reject) => {
          stream.on('data', console.log.bind(console));
          stream.on('error', reject);
          stream.on('finish', resolve);
        }),
    ),
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
