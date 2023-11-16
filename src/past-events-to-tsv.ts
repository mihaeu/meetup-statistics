import { EventResponse } from "./fetch-past-events.js"

export const pastEventsToTsv = (events: EventResponse[]) => {
	const header = [
		"id",
		"title",
		"event_url",
		"description",
		"venue",
		"creator",
		"created_time",
		"start_time",
		"end_time",
		"going",
		"event_type",
		"host1",
		"host2",
		"host3",
		"attendees",
	]
	const rows = events.map((event) => {
		try {
			return [
				event.id,
				event.title.replaceAll('"', "'"),
				event.eventUrl,
				event.description.replaceAll(/\n+/g, " ").replaceAll('"', "'"),
				event.venue && event.eventType === "PHYSICAL"
					? `${event.venue.name.replaceAll('"', "'")}, ${event.venue.address}, ${event.venue.city}`
					: "",
				event.creatorMember.name?.replaceAll('"', "'"),
				event.createdTime,
				event.dateTime,
				event.endTime,
				event.going.totalCount,
				event.eventType,
				(event.eventHosts[0]?.name ?? "").replaceAll('"', "'"),
				(event.eventHosts[1]?.name ?? "").replaceAll('"', "'"),
				(event.eventHosts[2]?.name ?? "").replaceAll('"', "'"),
				event.rsvps.edges
					.map((rsvp) => rsvp.node.member.name)
					.join(", ")
					.replaceAll('"', "'"),
			]
		} catch (e) {
			console.error(event)
			throw e
		}
	})
	return [header, ...rows].map((row) => '"' + row.join(`"\t"`) + '"').join("\n")
}
