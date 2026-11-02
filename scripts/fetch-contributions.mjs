// Fetches the GitHub contribution calendar for the site owner and writes
// public/data/contributions.json as [{ date, count, level }], plus totals.
//
// Auth: GITHUB_TOKEN env (Actions) or, locally, the `gh` CLI's stored token.
// Private contributions are only counted when the profile setting
// "Include private contributions" is on, or the token can see them.
import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const LOGIN = process.env.GH_LOGIN || 'blacksun90'
const OUT = 'public/data/contributions.json'

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  try {
    return execSync('gh auth token', { encoding: 'utf8' }).trim()
  } catch {
    throw new Error('No GITHUB_TOKEN and `gh auth token` failed')
  }
}

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { login: LOGIN } }),
})
if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`)
const json = await res.json()
if (json.errors) throw new Error(JSON.stringify(json.errors))

const col = json.data.user.contributionsCollection
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }
const days = col.contributionCalendar.weeks.flatMap((w) =>
  w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 })),
)

const out = {
  login: LOGIN,
  fetchedAt: new Date().toISOString(),
  total: col.contributionCalendar.totalContributions,
  restricted: col.restrictedContributionsCount,
  days,
}
mkdirSync('public/data', { recursive: true })
writeFileSync(OUT, JSON.stringify(out))
console.log(`${OUT}: total ${out.total} (restricted ${out.restricted}), ${days.length} days`)
