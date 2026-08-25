// The landing page is maintained in one place and served at both `/` and `/home`.
// Keeping this route as a re-export makes `/` the canonical, active homepage.
export { default } from "./home/page";
