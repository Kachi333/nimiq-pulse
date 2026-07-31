import { readSeedFile, seedApps } from './seed-core.js'

const useDemo = process.argv.includes('--demo')
const apps = readSeedFile(useDemo)

if (apps.length === 0) {
  console.log('registry.seed.json has no apps.')
  console.log('Add real Mini App receiving addresses, or run `npm run seed -- --demo`')
  console.log('to insert the pipeline-test entries (real addresses, not real Mini Apps).')
  process.exit(0)
}

const { added, skipped } = seedApps(apps)

console.log(`${added} added, ${skipped} skipped.`)
if (useDemo && added > 0) {
  console.log('\nDEMO entries inserted. Remove them before showing the registry to anyone:')
  console.log("  DELETE FROM apps WHERE category = 'demo';")
}
