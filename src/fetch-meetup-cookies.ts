import puppeteer from "puppeteer"

export const fetchMeetupCookies = async (username: string, password: string) => {
	const browser = await puppeteer.launch({ headless: "new", executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] })
	const page = await browser.newPage()
	await page.goto("https://www.meetup.com/login/")

	await page.waitForSelector("#onetrust-accept-btn-handler")
	await page.click("#onetrust-accept-btn-handler")

	await page.type('input[name="email"]', username, { delay: 50 })
	await page.type('input[name="current-password"]', password, { delay: 50 })
	await page.click('button[type="submit"]')

	await page.waitForSelector("#notifications-links")

	const cookies = await page.cookies()
	await browser.close()

	return cookies
		.map((cookie) => {
			return `${cookie.name}=${cookie.value}`
		}, {})
		.join("; ")
}
