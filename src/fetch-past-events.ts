import { MemberResponse } from "./fetch-members.js"

export type EventResponse = {
	id: string
	title: string
	eventUrl: string
	description: string
	group: {
		id: string
		name: string
		__typename: string
	}
	creatorMember: {
		id: string
		name?: string
		__typename: string
	}
	eventHosts: {
		memberId: string
		name?: string
		__typename: "EventHost"
	}[]
	feeSettings: null
	venue: {
		id: string
		name: string
		address: string
		city: string
		state: string
		country: string
		__typename: string
	}
	dateTime: string
	createdTime: string
	endTime: string
	going: {
		totalCount: number
		__typename: string
	}
	isAttending: boolean
	isOnline: boolean
	eventType: string
	status: string
	series: null
	featuredEventPhoto: {
		id: string
		source: string
		__typename: string
	}
	rsvps: {
		edges: {
			node: {
				id: string
				member: {
					id: string
					name: string
					memberPhoto: {
						id: string
						source: string
						__typename: "PhotoInfo"
					}
					__typename: "Member"
				}
				__typename: "Rsvp"
			}
			__typename: "RsvpEdge"
		}[]
		__typename: string
	}
	actions: string[]
	rsvpSettings: {
		rsvpsClosed: boolean
		__typename: string
	}
	isNetworkEvent: boolean
	networkEvent: null
	__typename: string
}

export const fetchPastEvents = async (
	members: MemberResponse[],
	groupName: string,
	cookie: string,
	after?: string,
): Promise<EventResponse[]> => {
	let pastEvents: EventResponse[] = []
	const response = await fetch("https://www.meetup.com/gql2", {
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
			cookie,
			Referer: `https://www.meetup.com/${groupName}/events/`,
			"Referrer-Policy": "strict-origin-when-cross-origin",
		},
		body: `{"operationName":"getPastGroupEvents","variables":{"urlname":"${groupName}"${
			after ? `,"after":"${after}"` : ""
		}},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"778d2bba8c4cc33b0f10eaa5f357dbcd8ac79c843148cdcfe4f76efabdbf7cc2"}}}`,
		method: "POST",
	})
	const json = await response.json()
	// @ts-ignore
	const pageCursor = json.data.groupByUrlname.events.pageInfo.endCursor
	// @ts-ignore
	const events = json.data.groupByUrlname.events.edges.map((el: { node: EventResponse }) => {
		const event = el.node
		event.creatorMember.name = members.find((member) => member.id === event.creatorMember.id)?.name
		event.eventHosts.forEach((eventHost) => {
			eventHost.name = members.find((member) => member.id === eventHost.memberId)?.name
		})
		return event
	})

	pastEvents = pastEvents.concat(events)

	if (events.length > 0) {
		process.stdout.write(".")
		await Bun.sleep(1000)
		pastEvents = pastEvents.concat(await fetchPastEvents(members, groupName, cookie, pageCursor))
	}

	return pastEvents
}
