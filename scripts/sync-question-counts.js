#!/usr/bin/env node

/**
 * sync-question-counts.js
 *
 * Reads all documents from the Firestore `questions` collection,
 * counts how many belong to each topicId, then writes the
 * `questionsCount` field onto each topic document.
 *
 * Uses the Firebase CLI login token — no service-account key needed.
 *
 * Usage:
 *   node scripts/sync-question-counts.js
 *
 * Prerequisites:
 *   - Authenticated via `firebase login`
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const PROJECT_ID = 'dev-interview-preparation'
const FIRESTORE_BASE = `/v1/projects/${PROJECT_ID}/databases/(default)/documents`

// ── Auth: get access token from Firebase CLI credentials ──
function getAccessToken() {
  const tokenPath = path.join(
    process.env.HOME,
    '.config/configstore/firebase-tools.json',
  )
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
  const refreshToken = tokens.tokens && tokens.tokens.refresh_token
  if (!refreshToken) {
    throw new Error('No refresh token found. Run `firebase login` first.')
  }

  const postData = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
    client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
  }).toString()

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
      (res) => {
        let data = ''
        res.on('data', (c) => (data += c))
        res.on('end', () => {
          const parsed = JSON.parse(data)
          if (!parsed.access_token) reject(new Error('Failed to get access token'))
          else resolve(parsed.access_token)
        })
      },
    )
    req.write(postData)
    req.end()
  })
}

// ── Firestore REST helpers ──
function firestoreRequest(token, method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'firestore.googleapis.com',
      path: urlPath,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { resolve(data) }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function getAllDocs(token, collectionId) {
  const docs = []
  let pageToken = null
  do {
    const url =
      `${FIRESTORE_BASE}/${collectionId}?pageSize=300` +
      (pageToken ? `&pageToken=${pageToken}` : '')
    const result = await firestoreRequest(token, 'GET', url)
    if (result.documents) docs.push(...result.documents)
    pageToken = result.nextPageToken || null
  } while (pageToken)
  return docs
}

function parseFields(fields) {
  const obj = {}
  for (const [key, val] of Object.entries(fields || {})) {
    if ('stringValue' in val) obj[key] = val.stringValue
    else if ('integerValue' in val) obj[key] = parseInt(val.integerValue, 10)
    else if ('booleanValue' in val) obj[key] = val.booleanValue
    else obj[key] = val
  }
  return obj
}

function docId(doc) {
  return doc.name.split('/').pop()
}

// ── Main ──
async function main() {
  console.log('🔑 Authenticating with Firebase CLI token…')
  const token = await getAccessToken()
  console.log('✅ Authenticated\n')

  console.log('📊 Counting questions per topic…\n')

  // 1. Fetch all questions
  const questionDocs = await getAllDocs(token, 'questions')
  console.log(`   Total question docs: ${questionDocs.length}`)

  // 2. Tally by topicId
  const counts = {}
  for (const doc of questionDocs) {
    const data = parseFields(doc.fields)
    if (data.topicId) counts[data.topicId] = (counts[data.topicId] || 0) + 1
  }

  // 3. Fetch all topics
  const topicDocs = await getAllDocs(token, 'topics')
  console.log(`   Total topic docs:    ${topicDocs.length}\n`)

  // 4. Update each topic with its count
  let updated = 0
  const topicIds = new Set()

  for (const doc of topicDocs) {
    const tid = docId(doc)
    topicIds.add(tid)
    const data = parseFields(doc.fields)
    const currentCount = data.questionsCount
    const newCount = counts[tid] || 0

    if (currentCount !== newCount) {
      // PATCH only the questionsCount field
      const patchUrl =
        `${FIRESTORE_BASE}/topics/${tid}?updateMask.fieldPaths=questionsCount`
      await firestoreRequest(token, 'PATCH', patchUrl, {
        fields: { questionsCount: { integerValue: String(newCount) } },
      })
      console.log(`   ✏️  ${tid}: ${currentCount ?? '(missing)'} → ${newCount}`)
      updated++
    } else {
      console.log(`   ✅ ${tid}: ${newCount} (no change)`)
    }
  }

  // Warn about orphaned topicIds
  for (const tid of Object.keys(counts)) {
    if (!topicIds.has(tid)) {
      console.log(
        `   ⚠️  topicId "${tid}" has ${counts[tid]} questions but no topic document!`,
      )
    }
  }

  if (updated > 0) {
    console.log(`\n🎉 Updated ${updated} topic(s).`)
  } else {
    console.log('\n✨ All counts are already up to date.')
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
