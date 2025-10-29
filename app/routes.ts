import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("gigs/:gigId", "routes/gigs.tsx", [
		index("routes/gigs/index.tsx"),
		route("edit", "routes/gigs/edit.tsx"),
	]),
	route("songs", "routes/songs.tsx", [
		index("routes/songs/index.tsx"),
		route(":songId", "routes/songs/edit.tsx"),
	]),
	route("about", "routes/about.tsx"),
	route("band-gig", "routes/band-gig.tsx"),
	route("*", "routes/404.tsx"),
] satisfies RouteConfig;
