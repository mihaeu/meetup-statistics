![](meetup-statistics.png)

# About

This project helps organizers of meetups get insights on past events and members in order to better help their group. You don't need a premium account for this, all you need is (co-)organizer access to the group you want to get statistics on.

# Usage

## Docker

If you don't want to worry about what version of `bun` etc. to use, just start the script using docker:

```bash
# this will take a lot of time to download dependecies etc. so be patiernt
docker run -it -v `pwd`:/app -w/app $(docker build -q .)
```

## Local

This assumes you have both chrome and bun installed. If you don't have bun installed, check out these [installation instructions](https://bun.sh/docs/installation).

```bash
bun install
bunx @puppeteer/browsers install chrome@stable --path $HOME/.cache/puppeteer
bun run fetch-meetup-group-statistics.ts
```

## Result

If everything goes well you should be queried about your meetup username, password and group's name. The source code is trivial, check what it does and don't trust scripts on the internet 😉

After running the scripts (depending on the number of members this can take several minutes, because I added delay in-between requests in order to be nice to meetup servers) you should two files called `members.tsv` and `past-events.tsv`. Those files can easily be imported into Microsoft Excel, Google Sheets etc. for further analysis.

Requests are cached in a `.cache` folder. If this is not desired, delete the folder before running the script (or delete only the `.cache/members.json` and `.cache/events.json` and keep all other ones, because they are timestamped).

### Events

| id  | title         | event_url                                       | description | venue      | creator | created_time | start_time  | end_time    | going | event_type | host1 | host2 | host3 | attendees                                |
| --- | ------------- | ----------------------------------------------- | ----------- | ---------- | ------- | ------------ | ----------- | ----------- | ----- | ---------- | ----- | ----- | ----- | ---------------------------------------- |
| 123 | Example event | https://www.meetup.com/example-group/events/123 | Description | Cool venue | Me      | Yesterday    | Today 20:00 | Today 21:00 | 99    | PHYSICAL   | Me    |       |       | Sarah, Joe, Miriam, Abdullah, Isaac, Kim |

### Members

| id  | name      | role      | joined        | status | last_visited | rsvp_yes | rsvp_no | rsvp_no_show | questions and answers...     |      |       |     |
| --- | --------- | --------- | ------------- | ------ | ------------ | -------- | ------- | ------------ | ---------------------------- | ---- | ----- | --- |
| 456 | Jessy Doe | Organizer | Two years ago | active | Today        | 3        | 2       | 1            | What is your favorite color? | pink | 1+2=? | 3   |
