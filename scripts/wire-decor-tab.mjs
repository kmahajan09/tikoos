import fs from 'fs'

const path = 'app/dashboard/event/[id]/page.tsx'
let s = fs.readFileSync(path, 'utf8')

s = s.replace(
  "import InvitesTab from './InvitesTab'",
  "import InvitesTab from './InvitesTab'\nimport DecorTab from './DecorTab'",
)

const decorBlock =
  /        \{activeTab === 'Decor' && \(\n          <div className="flex flex-col items-center justify-center py-24 gap-3">[\s\S]*?          <\/motion.div>\n        \)\}/

const replacement = `        {activeTab === 'Decor' && (
          <DecorTab eventId={id as string} />
        )}`

if (!decorBlock.test(s)) {
  const alt =
    /        \{activeTab === 'Decor' && \(\n          <div className="flex flex-col items-center justify-center py-24 gap-3">[\s\S]*?          <\/motion.div>\n        \)\}/
  if (!alt.test(s)) {
    console.error('Decor block not found')
    process.exit(1)
  }
  s = s.replace(alt, replacement)
} else {
  s = s.replace(decorBlock, replacement)
}

fs.writeFileSync(path, s)
console.log('ok')
