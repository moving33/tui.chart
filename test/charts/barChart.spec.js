/**
 * @fileoverview Test for BubbleChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import BarChart from '../../src/js/charts/barChart';

describe('Test for BarChart', () => {
    let barInstance;

    describe('constructor()', () => {
        beforeEach(() => {
            spyOn(BarChart.prototype, '_initializeOptions');
            spyOn(BarChart.prototype, '_createComponentManager').and.returnValue({
                register: jasmine.createSpy('register')
            });

            BarChart.prototype.options = {
                chartType: 'bar'
            };
            barInstance = new BarChart({
                categories: ['cate1', 'cate2', 'cate3'],
                series: {
                    'chartType': []
                }
            }, {
                title: {
                    fontSize: 14
                }
            }, {});
        });

        it('After the instance is created, the hasRightYAxis property must be set.', () => {
            expect(barInstance.hasRightYAxis).toEqual(jasmine.any(Boolean));
        });
    });
});
