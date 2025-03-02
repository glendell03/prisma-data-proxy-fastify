import { defineConfig } from 'tsup'
import { $, fs, path } from 'zx'
import { spawn } from 'child_process'

const port = 3010

const paths = {
  dist: path.join(__dirname, 'dist', 'src'),
  // cert: path.join(__dirname, 'dist', 'certs'),
}

const entrypoint = path.join(__dirname, 'src', 'server.ts')
const outfile = path.join(__dirname, 'dist', 'src', 'server.mjs')

export default defineConfig(async (options) => {
  if (!options.watch) {
    fs.rmSync(paths.dist, { recursive: true, force: true })
  }

  // if (!fs.existsSync(paths.cert)) {
  //   fs.mkdirpSync(paths.cert)
  //   // prettier-ignore
  //   await $`mkcert -key-file ${path.join(paths.cert,'cert-key.pem')} -cert-file ${path.join(paths.cert,'cert.pem')} "localhost"`
  // }

  if (
    !fs.existsSync(path.join(__dirname, 'node_modules', '.prisma', 'client'))
  ) {
    await $`yarn prisma generate`
  }

  return {
    entry: [entrypoint],
    splitting: false,
    outDir: paths.dist,
    sourcemap: options.watch ? 'inline' : false,
    minify: !options.watch,
    clean: true,
    format: 'esm',
    target: 'node16.16.0',

    onSuccess: async () => {
      if (options.watch) {
        const cmd = spawn(
          'node',
          [
            '--enable-source-maps',
            '--max_old_space_size=4096',
            '--inspect',
            outfile,
          ],
          {
            stdio: 'inherit',
          },
        )
        return () => {
          cmd.kill()
        }
      } else {
      }
    },
  }
})
