import "./App.css";
import Tooltip from "./Tooltip";

function App() {
	return (
		<>
			<div className="w-screen h-screen flex items-center justify-center">
				<Tooltip>
					<button type="button" className="bg-blue-500 text-white p-2 rounded">
						Hover me!
					</button>
					<Tooltip.Content position="bottom">
						Click me to see the tooltip! This is a tooltip that can be used
					</Tooltip.Content>
				</Tooltip>
			</div>
		</>
	);
}

export default App;
