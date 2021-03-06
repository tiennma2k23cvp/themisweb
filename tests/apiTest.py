#? |-----------------------------------------------------------------------------------------------|
#? |  /tests/apiTest.py                                                                            |
#? |                                                                                               |
#? |  Copyright (c) 2018-2021 Belikhun. All right reserved                                         |
#? |  Licensed under the MIT License. See LICENSE in the project root for license information.     |
#? |-----------------------------------------------------------------------------------------------|

from lib.log import log
log("OKAY", "Imported: lib.log.log")
import lib.ehook
log("OKAY", "Imported: lib.ehook")
import requests
log("OKAY", "Imported: requests")
import filecmp
log("OKAY", "Imported: filecmp")
from lib.testFramework import testFramework
log("OKAY", "Imported: lib.testFramework.testFramework")

# Start a new session
sess = requests.Session()
sauce = ""
apiTest = testFramework("API")

# Server Online Test
def __testServerOnline():
	global sess

	try:
		sess.get("http://localhost")
	except Exception as excp:
		return excp.__class__.__name__

	return True

apiTest.case("Server should be up and running", __testServerOnline)

def testAPI(url = "", method = "GET", json = True, data = {}, files = {}):
	global sess
	global sauce

	try:
		if (method == "GET"):
			data = sess.get("http://localhost" + url)
		else:
			data = sess.post("http://localhost" + url, data = data, files = files)

	except Exception as excp:
		return repr(excp)
	else:
		if (not ("application/json" in data.headers["Content-Type"]) and not json):
			return True

		try:
			jsonData = data.json()
		except Exception as excp:
			print(data.text)
			return repr(excp)
		else:
			if (jsonData["code"] != 0 and jsonData["code"] < 100):
				return "[{}] {}".format(jsonData["code"], jsonData["description"])
			
			if (jsonData["status"] >= 300):
				return "[{}] {}".format(jsonData["status"], jsonData["description"])

			if (jsonData["runtime"] > 1):
				return "RunTimeOverflow: {}s".format(str(round(jsonData["runtime"], 4)))

			try:
				jsonData["data"]["token"]
			except (KeyError, TypeError):
				pass
			else:
				sauce = jsonData["data"]["token"]

			return True

	return "Unknown"

# Login API Test
apiTest.case (
	"Should be logged in successful with account admin:admin",
	lambda: testAPI("/api/login", "POST", data = { "username": "admin", "password": "admin" })
)

# All GET api test
GETApiList = [
	"/api/config",
	"/api/info?u=admin",
	"/api/status",
	"/api/server",
	"/api/hash",
	"/api/announcement",
	"/api/contest/logs",
	"/api/contest/rank",
	"/api/contest/timer",
	"/api/contest/problems/list"
]

for item in GETApiList:
	apiTest.case (
		"API \"{}\" should return a good status code".format(item),
		lambda: testAPI(item, "GET")
	)

GETImageApi = ["/api/images/icon", "/api/images/landing"]
for item in GETImageApi:
	apiTest.case (
		"API i\"{}\" should return a good status code".format(item),
		lambda: testAPI(item, "GET", json = False, data = { "token": sauce })
	)

# All GET api with token required test
GETApiWithTokenList = ["/api/logs", "/api/contest/logs"]
for item in GETApiWithTokenList:
	apiTest.case (
		"API t\"{}\" should return a good status code".format(item),
		lambda: testAPI(item, "POST", data = { "token": sauce })
	)

# Avatar change API Test
def __avatarAPITest():
	global sauce

	result = testAPI("/api/avatar", "POST", data = { "token": sauce }, files = { "file": open("api/admin.jpg", "rb") })
	if (result is not True):
		return result

	if (filecmp.cmp("../data/avatar/admin.jpg", "api/admin.jpg")):
		return True
	
	return "FileNotMatch"
		
apiTest.case (
	"Avatar should be uploaded successfully with \"/api/avatar\" API and have no corruption",
	__avatarAPITest
)

# Logout API Test
apiTest.case (
	"Should be logged out successfully",
	lambda: testAPI("/api/logout", "POST", data = { "token": sauce })
)

# Complete Test
apiTest.complete()
