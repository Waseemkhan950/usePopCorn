import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import StarRating from "./components/StarRating";

import "./index.css";
import App from "./App.jsx";

// function Test() {
// 	const [movieRating, setMovieRating] = useState();
// 	return (
// 		<div>
// 			<StarRating color="blue" maxRating={10} onSetRating={setMovieRating} />
// 			<p>This movie was rated {movieRating} stars</p>
// 		</div>
// 	);
// }

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<App />
		{/* <Test /> */}
		{/* <StarRating
			maxRating={5}
			message={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
		/>
		<StarRating maxRating={5} color="green" />
		<StarRating maxRating={5} defaultRating={3} /> */}
	</StrictMode>
);
