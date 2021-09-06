import { createReadStream, readdirSync } from 'fs';
import { parse, map, filter, NodeCue, formatTimestamp } from 'subtitle';
import { toValidAmulet } from './amulet';

async function main() {
  for (const file of readdirSync('./subs')) {
    const stream = createReadStream(`./subs/${file}`)
      .pipe(parse())
      .pipe(filter((node) => node.type === 'cue'))
      .pipe(filter((node) => !!toValidAmulet((node as NodeCue).data.text)))
      .pipe(
        map((node) => {
          const start = formatTimestamp((node as NodeCue).data.start, { format: 'WebVTT' });
          const end = formatTimestamp((node as NodeCue).data.end, { format: 'WebVTT' });
          return {
            amulet: (node as NodeCue).data.text,
            title: `${file} // ${start}—${end}`,
          };
        }),
      );

    stream.on('data', console.log.bind(console));
    await new Promise((resolve) => stream.on('finish', resolve));
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
