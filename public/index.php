<?php
	//? |-----------------------------------------------------------------------------------------------|
	//? |  /public/index.php                                                                            |
	//? |                                                                                               |
	//? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
	//? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
	//? |-----------------------------------------------------------------------------------------------|
	
	// SET PAGE TYPE
	define("PAGE_TYPE", "NORMAL");

	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/ratelimit.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/libs/belibrary.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/config.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/problem.php";
	require_once $_SERVER["DOCUMENT_ROOT"] ."/modules/contest.php";

	$root = str_replace("\\", "/", $_SERVER["DOCUMENT_ROOT"]);
	$path = str_replace("\\", "/", getcwd());
	$clientPath = str_replace($_SERVER["DOCUMENT_ROOT"], "", $path);
	$size = convertSize(folderSize($path));

	$contestStarted = contest_timeRequire([CONTEST_STARTED]);
	$attachment = $contestStarted
		? problemListAttachment()
		: Array();

	$filesList = glob($path ."/*.*");
	$list = Array();

	foreach ($filesList as $key => $file) {
		if (strpos($file, ".htaccess") !== false || strpos($file, "index.php") !== false)
			continue;

		array_push($list, Array(
			"file" => basename($file),
			"size" => convertSize(filesize($file)),
			"url" => $clientPath ."/". basename($file),
			"lastmodify" => date("d/m/Y H:i:s", filemtime($file))
		));
	}
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title><?php print "Index of ". $clientPath ?> | <?php print APPNAME ." v". VERSION; ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/scrollbar.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/button.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/css/menu.css?v=<?php print VERSION; ?>" />
	<!-- Fonts -->
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/calibri/calibri.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/nunito/nunito.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/opensans/opensans.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/consolas/consolas.css?v=<?php print VERSION; ?>" />
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/fonts/fontawesome/fontawesome.css?v=<?php print VERSION; ?>" />

	<style>
		body {
			position: relative;
			display: block;
			margin: unset;
			width: 100%;
			height: 100vh;
			overflow-x: hidden;
			overflow-y: auto;
		}

		body:not(.embeded) {
			background-color: gray;
		}

		span.dot {
			position: relative;
			display: inline-block;
			width: 4px;
			height: 4px;
			background-color: rgb(102, 102, 102);
			border-radius: 50%;
			margin: 2px 4px;
		}

		.menu .group .item .left .file-origin,
		.menu .group .item .left .file-name,
		.menu .group .item .left .file-info {
			display: block;
		}

		.menu .group .item .left .file-origin {
			font-weight: bold;
			font-size: 12px;
		}

		.menu .group .item .left .file-name {
			font-size: 16px;
			color: #16a085;
		}
	</style>

</head>

<body>

	<div class="menu">
		<div class="group home">
			<t class="title big">C??c t???p c??ng khai</t>
			<t class="title small">Danh s??ch c??c t???p c??ng khai c?? th??? t???i v???</t>
			<div class="space"></div>
		</div>

		<div class="group file">
			<t class="title">T???p ????nh k??m trong c??c ????? b??i</t>

			<?php if ($contestStarted !== true) { ?>

				<div class="item lr warning">
					<t class="left">Danh s??ch t???p ???? b??? ???n v?? kh?? thi ch??a b???t ?????u.</t>
					<div class="right"></div>
				</div>

			<?php } elseif (sizeof($attachment) === 0) { ?>

				<div class="item lr info">
					<t class="left">Kh??ng t??m th???y t???p ????nh k??m n??o.</t>
					<div class="right"></div>
				</div>

			<?php } else foreach ($attachment as $key => $value) { ?>
					
				<div class="item lr">
					<div class="left">
						<t class="file-origin"><?php print $value["name"]; ?> [<?php print $value["id"]; ?>]</t>
						<t class="file-name"><?php print $value["attachment"]; ?></t>
						<t class="file-info">
							Ng??y s???a ?????i: <?php print date("d/m/Y H:i:s", $value["lastmodify"]); ?>
							<span class="dot"></span>
							K??ch c???: <?php print convertSize($value["size"]); ?>
						</t>
					</div>

					<div class="right">
						<a href="<?php print $value["url"]; ?>" class="sq-btn green" download="<?php print $value["attachment"]; ?>">T???i v???</a>
					</div>
				</div>

			<?php } ?>

		</div>

		<div class="group file">
			<t class="title"><?php print "Index of ". $clientPath ?></t>
			<t class="title small">Total size: <?php print $size ?></t>

			<?php if (sizeof($list) === 0) { ?>

				<div class="item lr info">
					<t class="left">Kh??ng t??m th???y t???p n??o.</t>
					<div class="right"></div>
				</div>

			<?php } else foreach ($list as $key => $value) { ?>
				
				<div class="item lr">
					<div class="left">
						<t class="file-name"><?php print $value["file"]; ?></t>
						<t class="file-info">
							Ng??y s???a ?????i: <?php print $value["lastmodify"]; ?>
							<span class="dot"></span>
							K??ch c???: <?php print $value["size"]; ?>
						</t>
					</div>

					<div class="right">
						<a href="<?php print $value["url"]; ?>" class="sq-btn" download="<?php print $value["file"]; ?>">T???i v???</a>
					</div>
				</div>

			<?php } ?>
		</div>

	</div>

	<!-- Library -->
	<script type="text/javascript" src="/assets/js/belibrary.js?v=<?php print VERSION; ?>"></script>
	<script type="text/javascript">
		if (localStorage.getItem("display.nightmode") === "true")
			document.body.classList.add("dark");

		if (window.frameElement)
			document.body.classList.add("embeded");
	</script>

	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=<?php print TRACK_ID; ?>"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() { dataLayer.push(arguments) }
		gtag("js", new Date());

		gtag("config", `<?php print TRACK_ID; ?>`);
	</script>
</body>

</html>