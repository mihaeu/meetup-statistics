type GetGroupRatingResponse = {
	data: {
		groupByUrlname: {
			id: string
			stats: {
				eventRatings: {
					total: number
					average: number
					__typename: "GroupStatsEventRatings"
				}
				__typename: "GroupStats"
			}
			__typename: "Group"
		}
	}
}

export const fetchGroupIdByName = async (groupName: string, cookie: string): Promise<string> => {
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
		body: `{
  "operationName": "getGroupRating",
  "variables": {
    "groupUrlname": "${groupName}"
  },
  "query": "query getGroupRating($groupUrlname: String!) {\\n  groupByUrlname(urlname: $groupUrlname) {\\n    id\\n    stats {\\n      eventRatings {\\n        total\\n        average\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"
}`,
		method: "POST",
	})
	const json = (await response.json()) as GetGroupRatingResponse

	return json.data.groupByUrlname.id.trim()
}
