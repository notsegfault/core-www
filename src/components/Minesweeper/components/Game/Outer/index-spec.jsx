import React from 'react';
import Outer from './';
import Top from './Top';
import Bottom from './Bottom';
import styles from './styles.css';

describe('Outer', () => {
	it('should render as an outer element with two children Top and Bottom', () => {
		styles.outer = 'outer';

		const tree = sd.shallowRender(
			<Outer />
		);
		const vdom = tree.getRenderOutput();

		expect(vdom).toEqualJSX(
			<div className={'outer'}>
				<Top />
				<Bottom />
			</div>
		);
	});
});
