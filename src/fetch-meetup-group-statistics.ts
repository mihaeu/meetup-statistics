import { fetchMeetupCookies } from "./fetch-meetup-cookies.js"
import { fetchMembers } from "./fetch-members.js"
import { fetchPastEvents } from "./fetch-past-events.js"
import { membersToTsv } from "./members-to-tsv.js"
import { pastEventsToTsv } from "./past-events-to-tsv.js"
import { createInterface } from "readline/promises"
import { stdin as input, stdout as output } from "node:process"
import {mkdir, exists} from "fs/promises";
import {join} from "path";

const rl = createInterface({ input, output })
let username
let password
let groupName

const cachePath = join(__dirname, '..', '.cache')
if (!(await exists(cachePath))) {
    await mkdir(cachePath)
}

const membersCache = Bun.file(`${cachePath}/members.json`, { type: "application/json" })
const membersCacheExists = await membersCache.exists()
const eventsCache = Bun.file(`${cachePath}/events.json`, { type: "application/json" })
const eventsCacheExists = await eventsCache.exists()

let cookie = ""
if (!membersCacheExists || !eventsCacheExists) {
	console.log("Logging in to meetup.com ...")
	username = await rl.question(`What is your username on meetup.com? `)
	password = await rl.question(`What is your password on meetup.com? `)
	cookie = await fetchMeetupCookies(username, password)
}
groupName = await rl.question(`What is your group's name on meetup.com? `)
rl.close()

console.log("Fetching members ...")

let members
if (membersCacheExists) {
	console.log("Using cache file ...")
	members = await membersCache.json()
} else {
	members = await fetchMembers(cookie, groupName, true, cachePath)
	await Bun.write(`${cachePath}/members.json`, JSON.stringify(members, null, 2))
}

console.log("Fetching events ...")

let events
if (eventsCacheExists) {
	console.log("Using cache file ...")
	events = await eventsCache.json()
} else {
	events = await fetchPastEvents(members, groupName, cookie)
	await Bun.write(`${cachePath}/events.json`, JSON.stringify(events, null, 2))
}

await Bun.write("members.tsv", membersToTsv(members))
await Bun.write("past-events.tsv", pastEventsToTsv(events))
