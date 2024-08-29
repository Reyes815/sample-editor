import { Tldraw } from 'tldraw';
import '../index.css';

const Draw = () => {
	return (
		<div style={{ position: 'fixed', inset: 0 }}>
			<Tldraw />
		</div>
	)
}

export default Draw