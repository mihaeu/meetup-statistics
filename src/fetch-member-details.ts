export type MemberExtraInfo = {
	questions: { [key: string]: string }
	rsvp_yes: number
	rsvp_no: number
	rsvp_no_show: number
}

export const fetchMemberDetails = async (id: string | number, groupName: string, cookie: string) => {
	const response = await fetch(`https://www.meetup.com/${groupName}/members/${id}/profile`, {
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
			Referer: `https://www.meetup.com`,
			"Referrer-Policy": "strict-origin-when-cross-origin",
		},
		method: "GET",
	})
	const html = await response.text()
	const matches = html.matchAll(
		/(<p class="text--bold">(?<question>.+?)<\/p><p>(?<answer>.+?)<\/p>|<span>RSVPs<\/span><\/p><span><span>(?<rsvp_yes>\d+) yes<\/span><\/span><span class="text--middotLeft display--inline"><span>(?<rsvp_no>\d+) no<\/span>(?:<\/span><span class="text--middotLeft display--inline"><span>(?<rsvp_no_show>\d+) no-show<\/span>)?)/g,
	)
	return [...matches].reduce(
		(extraInfo, match) => {
			if (match.groups?.rsvp_yes !== undefined) {
				extraInfo.rsvp_yes = Number.parseInt(match.groups?.rsvp_yes, 10)
				extraInfo.rsvp_no = Number.parseInt(match.groups?.rsvp_no, 10)
				extraInfo.rsvp_no_show = Number.parseInt(match.groups?.rsvp_no_show ?? 0, 10)
			}
			if (match.groups?.question !== undefined) {
				extraInfo.questions[match.groups?.question.replaceAll(/<\/?\w+>/g, "")] = match.groups?.answer
			}
			return extraInfo
		},
		{ questions: {}, rsvp_yes: 0, rsvp_no: 0, rsvp_no_show: 0 } as MemberExtraInfo,
	)
}
