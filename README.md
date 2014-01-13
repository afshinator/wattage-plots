Wattage Plots 
=============

Wattage Plots shows meaningful visualizations of kilo-watt per hour energy usage of data pulled in from a CSV file.   Data is displayed using the fantastic data-driven [D3 visualization library].

![alt text][logo]

##### By: [Afshin Mokhtari](https://github.com/afshinator), Aug 2013
[Click here](http://acuafshin.com/plotwatt/) to check it out!

----
### Purpose:
- Learn me some D3.  
- Build & use javascript classes that encapsulate details of specific chart types (like bar-chart, heat-chart) that otherwise require a variety of complex and easy-to-forget mixings of D3 elements.
- Provide visualizations of tabular numerical data in a manner that makes it easy to see patterns in the data.
- Have some fun, show some skills, learn new ones.

#### Data: 
- From PlotWatt.com, in the form of a .csv file (included in the project tree).

#### Tools:
- Javascript, HTML, CSS
- Twitters bootstrap
- D3.js visualization libarary


<hr>

### How to view and play with the project:
The quickest way is to click on the link above; of course you can always 'git clone' the project down to your local machine.

#### Please Note:

If you're running the project from a web server, browse to the project directory root or pull index.html into your browser as normal, and everything will work fine if you've preserved the directory structure of the source tree.

If you pulled the project down to your local machine and want to drag index.html from your file system into the browser, <b>Chrome and IE will not let the app access your local file system</b> to pull in the csv file where all the data lives; Firefox will though!</i>  ( Its a security issue, find out more by looking into cross-origin request policies.) 


---
### Some Details:
Data in the PlotWatt sample file is read in & visualized in a few different ways.

Looking at the data I saw that it primarily varied based on time of year, so I chose to sum up the bulk of what I thought there is to be learned by displaying a <b>"calendar heat chart"</b> that shows total usage per day, over the range of the sample.

There are also calendar heat charts for totals per day broken down by appliance type.  What is so nice about the breakdown by appliance type is that you can see stuff like the fact that <b>they only cook on weekends!</b>

Briefly on implementation, displaying a variety of charts was simplified by the work I did to encapsulate the charts functionality into their own classes, ready to be instantiated will nifty options.

With the data, I also wanted to present which appliance types usage varied the most.  The <b>stacked bar chart</b> does a good job of that, and you can also see at a glance how <b>temperature control in general dominates the variance in use</b>.

Last, I wanted to show the relative variance in use of all appliances totals split up into the 4 sectors of the day from which we have data... but alas the normalized bar chart I made really wasn't too informative - so I took it out!

Comments and criticisms welcome.

[D3 visualization library]:http://d3js.org/
[logo]:http://res.cloudinary.com/techblogpics/image/upload/v1389573420/wattage-logo1_viz8jd.png "Wattage Plotter logo"
