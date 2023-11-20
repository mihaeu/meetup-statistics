import { fetchMemberDetails, MemberExtraInfo } from "./fetch-member-details.js"
import {exists} from "fs/promises";

export type MemberResponse = {
	id: string
	joined: string
	name: string
	role: string
	status: string
	intro: string
	title: string
	last_visited: string
	photo: {
		id: string
		highres_link: string
		thumb_link: string
	}
	self: {
		actions: string[]
	}
	extraInfo?: MemberExtraInfo
}

const encodeRFC3986URIComponent = (str: string) => {
	return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
}

export const fetchMembers = async (cookie: string, groupName: string, withExtraInfo: boolean = false, cachePath: string) => {
	let page = 1
	let members: MemberResponse[] = []
	let currentResponse = []
	do {
		console.log(`Fetching page ${page} ...`)
		const queries = encodeRFC3986URIComponent(
			`(endpoint:groups/${groupName}/members,list:(dynamicRef:list_groupMembers_${groupName}_all,merge:(isReverse:!f)),meta:(method:get),params:(filter:all,page:${page}),ref:groupMembers_${groupName}_all)`,
		)
		const response = await fetch(`https://www.meetup.com/mu_api/urlname/members?queries=${queries}`, {
			headers: {
				accept: "*/*",
				"accept-language": "en-US",
				"apollographql-client-name": "nextjs-web",
				"content-type": "application/json",
				"sec-ch-ua": '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": '"Linux"',
				"sec-fetch-dest": "empty",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-meetup-view-id": "43222e6b-8582-44cf-9188-318ff7bc6a29",
				cookie,
				Referer: `https://www.meetup.com/${groupName}/`,
				"Referrer-Policy": "strict-origin-when-cross-origin",
			},
			method: "GET",
		})
		const json = await response.json()

		// @ts-ignore
		currentResponse = json.responses[0].value.value
		members = members.concat(currentResponse)

		await Bun.sleep(1000)
		++page
	} while (currentResponse.length > 0)

	if (withExtraInfo) {
		console.log(`Adding extra info for members ...`)
		for (const member of members) {
            const extraInfoCache = `${cachePath}/${member.id}-${member.last_visited}.json`
            process.stdout.write(".")
            if (await exists(extraInfoCache)) {
                member.extraInfo = await Bun.file(extraInfoCache).json()
            } else {
                member.extraInfo = await fetchMemberDetails(member.id, cookie)
                await Bun.write(extraInfoCache, JSON.stringify(member.extraInfo))
                await Bun.sleep(500)
            }
		}
		console.log()
	}

	return members
}
