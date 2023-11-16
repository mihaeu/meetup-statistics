import { MemberResponse } from "./fetch-members.js"

export const membersToTsv = (members: MemberResponse[]) => {
	const header = [
		"id",
		"name",
		"role",
		"joined",
		"status",
		"last_visited",
		"rsvp_yes",
		"rsvp_no",
		"rsvp_no_show",
		"questions and answers...",
	]
	const rows = members.map((member) => {
		const questions = Object.entries(member.extraInfo?.questions ?? [])
			.flat()
			.map((s) => s.replaceAll('"', "'"))
		return [
			member.id,
			member.name.replaceAll('"', "'"),
			member.role,
			member.joined,
			member.status,
			member.last_visited,
			`${member.extraInfo?.rsvp_yes}`,
			`${member.extraInfo?.rsvp_no}`,
			`${member.extraInfo?.rsvp_no_show}`,
			...questions,
		]
	})
	return [header, ...rows].map((row) => '"' + row.join(`"\t"`) + '"').join("\n")
}
