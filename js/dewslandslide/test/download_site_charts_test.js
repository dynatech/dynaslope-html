const { expect } = chai;

describe("toggleChartDownloadCheckboxes", () => {
    it("should enable checkbox", () => {
        CHART_PLOTS = ["rainfall", "surficial", "node-health", "data-presence", "communication-health", "subsurface", "x-accelerometer", "y-accelerometer", "z-accelerometer", "battery"];
        toggleChartDownloadCheckboxes();
        const $cbox_group = $(".download-chart-checkbox");
        const check = $cbox_group.filter("[value=surficial]");
        expect(check.length).to.equal(1);
    });
});

describe("returnYaxisValue", () => {
    it("should return 400", () => {
        const get_return_value = returnYaxisValue("rainfall");
        expect(get_return_value).to.equal(400);
    });

    it("should return 800", () => {
        const get_return_value = returnYaxisValue("surficial");
        expect(get_return_value).to.equal(800);
    });
});
