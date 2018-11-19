const { expect } = chai;

describe("create div container for surficial buttons and charts", () => {

	it("shoud have div id = surficial-plots", () => {
		$("body").append($("<div>", {
            id: "surficial-plots"
        }));
        const find_tag = $("body").find("#surficial-plots").length;
        expect(find_tag).to.equal(1);
	});

	it("shoud have div id = surficial-plot-options", () => {
		$("#surficial-plots").append($("<div>", {
            id: "surficial-plot-options"
        }));
		const find_tag = $("body").find("#surficial-plot-options").length;
        expect(find_tag).to.equal(1);
	});

	it("shoud have div id = surficial-duration", () => {
		$("#surficial-plots").append($("<div>", {
            id: "surficial-duration"
        }));
		const find_tag = $("body").find("#surficial-duration").length;
        expect(find_tag).to.equal(1);
	});

	it("shoud have div id = surficial-markers-btn-group", () => {
		$("#surficial-plots").append($("<div>", {
            id: "surficial-markers-btn-group"
        }));
		const find_tag = $("body").find("#surficial-markers-btn-group").length;
		expect(find_tag).to.equal(1);
	});
});

describe("createSurficialMarkersButton", () => {

	it("should create marker buttons", () => {
		const markers = [
		    { name:"A", data:[{x:1502404980000,y:152.2,id:32729},{x:1502751060000,y:152.2,id:32871},{x:1503009240000,y:152.3,id:32986}],id:"A"},
		    { name:"B", data:[{x:1502404980000,y:152.2,id:32729},{x:1502751060000,y:152.2,id:32871},{x:1503009240000,y:152.3,id:32986}],id:"B"},
		    { name:"C", data:[{x:1502404980000,y:152.2,id:32729},{x:1502751060000,y:152.2,id:32871},{x:1503009240000,y:152.3,id:32986}],id:"C"},
		    { name:"D", data:[{x:1502404980000,y:152.2,id:32729},{x:1502751060000,y:152.2,id:32871},{x:1503009240000,y:152.3,id:32986}],id:"D"}
		];
		createSurficialMarkersButton(markers);
		const find_tag = $("#surficial-markers-btn-group").find("button").length;
		expect(find_tag).to.equal(5);
	});

	it("should create marker A for surficial cracks", () => {
		const find_tag = $("#surficial-markers-btn-group").find("button:contains('A')").length;
		expect(find_tag).to.equal(1);
	});

	it("should create marker B for surficial cracks", () => {
		const find_tag = $("#surficial-markers-btn-group").find("button:contains('B')").length;
		expect(find_tag).to.equal(1);
	});

	it("should create marker C for surficial cracks", () => {
		const find_tag = $("#surficial-markers-btn-group").find("button:contains('C')").length;
		expect(find_tag).to.equal(1);
	});

	it("should create marker D for surficial cracks", () => {
		const find_tag = $("#surficial-markers-btn-group").find("button:contains('D')").length;
		expect(find_tag).to.equal(1);
	});

	it("should remove all markers", () => {
		$("#surficial-markers-btn-group").empty();
		const find_tag = $("#surficial-markers-btn-group").find("button").length;
		expect(find_tag).to.equal(0);
	});
});

