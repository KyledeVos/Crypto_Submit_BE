# READ_ME

## Notes:
1. This project uses typedoc mainly for comments consistency, but has the advantage<br>
of also generating html doc files. The script to run it is in the package.json but this link<br> was helpful in getting it to run correctly from their site: https://typedoc.org/documents/Options.Input.html

## Project Setup

### Precautions:

1. The safety of these requirements is of the highest importance.<br>
In this project you will see a .env_blank. The .env_blank<br>
files contains the names of secure fields that the application uses but <br> has no actual data. The actual data goes in an untracked file that you need to create as '.env' created at the project root. Inside of this <br> file you will put the ACTUAL data.
**NOTE:** Do not ever put actual data in the .env_blank or change the .git_ignore file to track a .env file. Doing so will make your confidential<br>
data readily available on GitHub for users and bots to take.

2. If you are modifying the project - NEVER use hard coded secure values / keys<br> in the project files. These values go in the .env file and absolutely nowhere else. Do NOT even add these values in temporarily to the code.

### Files Needed
You will need the code for the Front-End and Backend of this application to be able to run it locally.
You will need a few services installed on your machine as well which is in the setup steps below.

### File Setup
After cloning the repos, at the project root you will need to create a .env file<br>
Then copy the contents of the .env_blank file into your created '.env' file.<br>

### API KEY
This is a **DEMO** Project and is not intended for professional use. It does use an API key from 'CoinMarketCap'<br>
You will need to visit their site, create an account and then get an API key to use in this project.<br>
After you have created your .env from the .env_blank file, add your key next to the COIN_API_KEY field<br>
You are solely responsible for the use of services from 3rd party and must do so in accordace <br>
with their policies. Again, this is a student demo project and not meant for professional use.

**NOTE:** A Missing key will fail server startup validations and terminate the server run
 
### MariaDB
1. This project uses **MariaDB** for the database. To make use of this you will need MariaDB<br>
to be installed on your machine. The following is the installation process for windows but<br>
you can research the steps needed for Mac/Linux.

a. If you do not have MariaDB installed on your machine, visit the official MariaDB site and go to<br>
their downloads page and donwload the MSI file. Note that these instructions are a simple guideline<br>
at the time of this project creation and your process may not match exactly.

b. After the download has completed, click on the downloaded .msi file (should be in downloads folder)<br> to open the installer. Then follow the prompts for the install process

c. It will ask for a password to be setup. This is the password for the 'root' user and ensure you do not <br> forget this password else you will not be able to use MariaDB<br>

d. A screen will come up with configuration with the TCP port set to 3306. This is the default port <br>
on which the database will be listening for network requests and you will configure the BE to match this port<br>
If you have another DB service already installed like MySQL then it may already use the port 3306.<br>
If will show an alert if the port is in use - correct this by simply providing a different port like 3308.

e. The installer should then run

**TEST THE MARIADB SERVER CONNECTION**<br>
I use HeidiSQL as the Client which needs to be installed to the system (but you can try others if you prefer)<br>. These instructions are for windows using HeidiSQL - and you will need to know the TCP port<br> and password that you set during the MariaDB install.<br>
If you have forgotten the port that you set, you can find it in the MariaDB files.<br>
On windows, navigate to Program Files -> MariaDB -> data and open the file my.ini<br>
In the file you will see the port that was set.<br>

f. Open a command terminal as an Administrator and then run this command to see if the service is running at the specified port<br>
netstat -ano |findstr [the port you set]<br>
for example: netstat -ano |findstr :3306

If set correctly, you will see a log that says it is listening on that port.

g. Open Heidi SQL and on the home page, select the option for a new session. 

h. Give the new session a name (like MariaDBLocal or whatever you like). Then configure it on the right-hand side.<br> 
The user should be root, enter the password that you set and that the TCP port is the same one used <br>
during the MariaDB install. The HostName / IP should be 127.0.0.1 for your localhost as this project is set <br> to run locally.

i. If the above is done correctly, click "Open" and you should see the HeidiSQL client open to the MariaDB database. If this is not happening, do not proceed to anything else. You need to research / watch tutorials to get MariaDB running correctly and to a point where you can see it in a client - if you bypass this step the project will not run correctly.
