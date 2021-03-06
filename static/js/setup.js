//? |-----------------------------------------------------------------------------------------------|
//? |  /static/js/setup.js                                                                          |
//? |                                                                                               |
//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
//? |-----------------------------------------------------------------------------------------------|

const setup = {
	container: $("#screens"),
	index: 9999,

	Screen: class {
		constructor({
			name = "sample",
			title = "sample title",
			description = "A sample Screen with sample title and sample description"
		} = {}) {
			this.container = buildElementTree("div", ["screen", "hidden"], [
				{ type: "span", class: "left", name: "left", list: [
					{ type: "icon", name: "icon" },
					{ type: "t", class: "title", name: "titleNode", text: title },
					{ type: "t", class: "description", name: "description", html: description }
				]},

				{ type: "span", class: "right", name: "right" }
			]);

			setup.container.appendChild(this.container.tree);

			/** @type {HTMLDivElement} */
			this.container = this.container.obj;

			this.container.dataset.screen = name;
			this.container.style.zIndex = setup.index--;

			this.setupHandlers = []
			this.completeHandlers = []
		}

		setup(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: `setup.Screen().setup(): not a valid function` }

			this.setupHandlers.push(f);
		}

		onComplete(f) {
			if (!f || typeof f !== "function")
				throw { code: -1, description: `setup.Screen().setup(): not a valid function` }

			this.completeHandlers.push(f);
		}

		async run() {
			this.container.classList.remove("hidden");
			this.container.classList.add("show");

			for (let f of this.setupHandlers)
				await f({
					screen: this,
					container: this.container,
					left: this.container.left,
					right: this.container.right
				});
		}

		async hide() {
			this.container.classList.add("hide");

			await delayAsync(600);
			this.container.classList.add("hidden");
			this.container.classList.remove("show", "run");

			for (let f of this.completeHandlers)
				await f();
		}

		linkNext(screen) {
			if (!screen || typeof screen.run !== "function")
				throw { code: -1, description: `setup.Screen().linkNext(): not a valid Screen` }

			this.onComplete(() => screen.run());
		}
	},

	async init() {
		this.container.classList.add("show");

		//? ============================ INTRO SCREEN ============================
		const intro = new this.Screen({
			name: "intro",
			title: "ch??o m???ng!",
			description: "C???m ??n b???n ???? tin d??ng <b>Themis Web Interface</b>! Ch??? c??n v??i b?????c n???a l?? b???n ???? ho??n th??nh vi???c c??i ?????t h??? th???ng!"
		});

		intro.setup(async ({ screen, container, left, right }) => {
			let icon = new lazyload({
				source: "/assets/img/icon.webp",
				classes: "icon"
			});

			let title = document.createElement("t");
			title.classList.add("title");
			title.innerText = "Themis Web Interface";

			let nextButton = createButton("Ti???p Theo", { color: "blue", complex: true });
			nextButton.classList.add("nextBtn");

			left.appendChild(nextButton);
			right.append(icon.container, title);
			await icon.wait();

			$("#loadingScreen").classList.add("hide");

			await delayAsync(1600);
			container.classList.add("showIcon");

			await delayAsync(5000);
			$("#header").classList.add("show");

			await delayAsync(400);
			container.classList.add("run");

			nextButton.addEventListener("mouseup", () => screen.hide());
		});

		//? ============================ LICENSE SCREEN ============================

		const licenseScreen = new this.Screen({
			name: "license",
			title: "b???n quy???n",
			description: `M?? ngu???n m??? c???a h??? th???ng n??y ???????c c???p ph??p theo b???n quy???n <b>MIT</b>. H??y ?????c k?? tr?????c khi s??? d???ng h??? th???ng!`
		});

		licenseScreen.setup(({ screen, container, left, right }) => {
			let iframe = document.createElement("iframe");
			iframe.src = "/licenseInfo.php";
			
			let button = createButton("Ti???p Theo", { color: "green", complex: true });
			button.addEventListener("mouseup", () => screen.hide());

			left.appendChild(button);
			right.appendChild(iframe);
			container.classList.add("run");
		});

		//? ============================ ACCOUNT SCREEN ============================
		const accountSetup = new this.Screen({
			name: "account",
			title: "t??i kho???n",
			description: "????y s??? l?? t??i kho???n qu???n tr??? c???a b???n. V???i t??i kho???n c?? quy???n qu???n tr??? b???n c?? th??? thay ?????i c??i ?????t h??? th???ng, ch???nh s???a t??i kho???n v?? c???p quy???n qu???n tr??? cho t??i kho???n kh??c!"
		})

		accountSetup.setup(({ screen, container, left, right }) => {
			let form = buildElementTree("form", [], [
				{ name: "note", node: createNote({
					level: "warning",
					message: "T??n ????ng nh???p ch??? ???????c ph??p ch???a c??c k?? t??? t??? <b>a-z, A-Z v?? 0-9</b>"
				}) },
				{ name: "errorNote", node: createNote() },
				{ name: "username", node: createInput({ label: "T??n Ng?????i D??ng", color: "blue", required: true, autofill: false }) },
				{ name: "password", node: createInput({ label: "M???t Kh???u", type: "password", color: "blue", required: true, autofill: false }) },
				{ name: "verifyPassword", node: createInput({ label: "Nh???p L???i M???t Kh???u", type: "password", color: "blue", required: true, autofill: false }) },
				{ name: "submit", node: createButton("T???o T??i Kho???n", { color: "green", type: "submit", complex: true }) }
			]);

			right.appendChild(form.tree);
			form = form.obj;

			form.autocomplete = "off";
			form.action = "javascript:void(0);";
			form.submit.disabled = true;
			form.errorNote.group.style.display = "none";

			const update = () => {
				let u = form.username.input.value;
				let p = form.password.input.value;
				let rp = form.verifyPassword.input.value;

				if (p !== "" && rp !== "" && rp !== p) {
					form.submit.changeText(`M???t Kh???u Kh??ng Kh???p!`);
					form.submit.dataset.triColor = "red";
					form.submit.disabled = true;
					return;
				}

				if (u !== "" && p !== "" && rp !== "") {
					form.submit.changeText(`T???o T??i Kho???n`);
					form.submit.dataset.triColor = "green";
					form.submit.disabled = false;
					return;
				}

				form.submit.changeText(`T???o T??i Kho???n`);
				form.submit.dataset.triColor = "blue";
				form.submit.disabled = true;
			}

			const createAccount = async (username, password) => {
				form.submit.disabled = true;
				form.username.input.disabled = true;
				form.password.input.disabled = true;
				form.verifyPassword.input.disabled = true;
				form.errorNote.group.style.display = "none";

				let response = null;

				try {
					response = await myajax({
						url: "/api/register",
						method: "POST",
						form: {
							username,
							password
						}
					});
				} catch(e) {
					form.errorNote.group.style.display = null;
					form.errorNote.set({ level: "error", message: `<b>[${e.data.code}]</b> ${e.data.description}` });

					form.username.input.disabled = false;
					form.password.input.disabled = false;
					form.verifyPassword.input.disabled = false;
					update();
					return;
				}

				screen.hide();
			}

			form.username.input.addEventListener("input", () => update());
			form.password.input.addEventListener("input", () => update());
			form.verifyPassword.input.addEventListener("input", () => update());
			form.submit.addEventListener("click", () => createAccount(form.username.input.value, form.password.input.value));
			
			container.classList.add("run");
		});

		//? ============================ CONFIG SCREEN ============================
		
		const configScreen = new this.Screen({
			name: "config",
			title: "c??i ?????t",
			description: `B???n c?? th??? thay ?????i c??i ?????t h??? th???ng v??? sau t???i <b>Menu > qu???n tr??? > Admin Control Panel</b>`
		});

		configScreen.setup(({ screen, container, left, right }) => {
			let iframe = document.createElement("iframe");
			iframe.src = "/config.php";
			
			let button = createButton("Ti???p Theo", { color: "green", complex: true });
			button.addEventListener("mouseup", () => screen.hide());

			left.appendChild(button);
			right.appendChild(iframe);
			container.classList.add("run");
		});

		//? ============================ COMPLETE SCREEN ============================

		const completeScreen = new this.Screen({
			name: "complete",
			title: "ho??n th??nh!",
			description: `B???n ???? ho??n th??nh vi???c thi???t l???p <b>Themis Web Interface</b>! N???u c?? b???t k?? v?????ng m???c g?? h??y t??m ki???m tr??n trang <b>Wiki</b> ho???c ?????t c??u h???i tr??n trang Github c???a d??? ??n!`
		});

		completeScreen.setup(async ({ screen, container, left, right }) => {
			let redirect = document.createElement("div");
			redirect.classList.add("redirect");
			redirect.innerHTML = `<span class="simpleSpinner"></span>??ang chuy???n h?????ng t???i Trang Ch???...`;

			left.appendChild(redirect);
			container.classList.add("run");

			await delayAsync(5000);
			window.location = "/";
		});
		
		if (VALID_SETUP) {
			intro.linkNext(licenseScreen);
			licenseScreen.linkNext(accountSetup);
			accountSetup.linkNext(configScreen);
			configScreen.linkNext(completeScreen);
			intro.run();
		} else {
			intro.linkNext(completeScreen);
			intro.run();
		}
	}
}

window.addEventListener("load", () => setup.init());