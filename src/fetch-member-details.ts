export type MemberExtraInfo = {
	questions: { [key: string]: string }
	rsvp_yes: number
	rsvp_no: number
	rsvp_no_show: number
	rsvp_waiting_list: number
}

type RSVPStatus = "ATTENDED" | "NO" | "YES"
type Role = "MEMBER" | "ORGANIZER" | "COORGANIZER"
export type MemberDetailsResponse = {
	data: {
		member: {
			id: string
			isOrganizer: boolean
			isMemberPlusSubscriber: boolean
			memberPhoto: {
				id: string
				baseUrl: string
				__typename: "PhotoInfo"
			}
			name: string
			pastAndFutureRsvps: {
				pageInfo: {
					hasNextPage: boolean
					endCursor: string
					__typename: "PageInfo"
				}
				totalCount: number
				edges: {
					node: {
						id: string
						status: RSVPStatus
						event: {
							id: string
							title: string
							eventUrl: string
							dateTime: string
							status: "PAST"
							__typename: "Event"
						}
						__typename: "Rsvp"
					}
					__typename: "RsvpEdge"
				}[]
				__typename: "MemberRsvpConnection"
			}
			__typename: "Member"
		}
		group: {
			id: string
			urlname: string
			name: string
			keyGroupPhoto: {
				id: string
				baseUrl: string
				__typename: "PhotoInfo"
			}
			duesSettings: null
			isPrivate: boolean
			isMember: boolean
			needsQuestions: boolean
			membershipMetadata: {
				role: Role
				__typename: "Membership"
			}
			memberships: {
				edges: {
					metadata: {
						bio: string
						joinTime: string
						role: Role
						status: "ACTIVE"
						title: ""
						eventsAttended: number
						rsvpStats: {
							goingWentCount: number
							notGoingDidntGoCount: number
							waitlistCount: number
							noShowCount: number
							__typename: "MembershipRsvpStats"
						}
						profileQuestionsAnswers: {
							questionId: string
							question: string
							answer: string
							__typename: "ProfileQuestionAnswer"
						}[]
						dues: null
						__typename: "Membership"
					}
					__typename: "GroupMemberEdge"
				}[]

				__typename: "GroupMemberConnection"
			}
			__typename: "Group"
		}
	}
}

export const fetchMemberDetails = async (
	id: string | number,
	groupName: string,
	groupId: string,
	cookie: string,
): Promise<MemberExtraInfo> => {
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
		body: `{"operationName":"getMembershipDetails","variables":{"memberId":"${id}","memberIntId":${id},"groupId":"${groupId}"},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"3be499b5e6b12848b8120ee8827721c1a04af2391cea3a2833ae12459c4c120e"}}}`,
		method: "POST",
	})
	const json = (await response.json()) as MemberDetailsResponse

	const metadata = json.data.group.memberships.edges[0].metadata
	if (!metadata) {
		return {
			rsvp_no_show: 0,
			rsvp_yes: 0,
			rsvp_no: 0,
			rsvp_waiting_list: 0,
			questions: {},
		}
	}

	return {
		rsvp_no_show: metadata.rsvpStats.noShowCount,
		rsvp_yes: metadata.rsvpStats.goingWentCount,
		rsvp_no: metadata.rsvpStats.notGoingDidntGoCount,
		rsvp_waiting_list: metadata.rsvpStats.waitlistCount,
		questions: metadata.profileQuestionsAnswers.reduce(
			(questions, response) => {
				questions[response.question] = response.answer
				return questions
			},
			{} as { [key: string]: string },
		),
	}
}
