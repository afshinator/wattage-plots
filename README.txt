This little web app will show visualizations of the data from the excel file downloaded from:

http://plotwatt.com/plotwatt_appliance_data.csv

If you're accessing these files from a web server, pull up index.html as normal and everything should
work fine if you preserved the directory structure it was archived as.

If you directly drag index.html from your desktop into the browser, Chrome and IE will have problems; 
best to use Firefox.

---

Data in the PlotWatt sample file is read in & visualized in a variety of ways.

Looking at the data I saw that it primarily varied based on time of year, so
I chose to sum up the bulk of what I thought there is to be learned by displaying
a "calendar heat chart" that shows total usage per day, over the range of the sample.

There are also calendar heat charts for totals per day broken down by appliance type.
What is so nice about the breakdown by appliance type is that you can see stuff
like the fact that they only cook on weekends! 

I also wanted to present which appliance type varied the most.  The stacked bar chart
chart does a good job of that, as well as showing how temperature control in general
dominates the variance in use.

Last I wanted to show the relative variance in use of all appliances totals split up
into the 4 sectors of the day from which we have data... but alas the normalized
bar chart I made looked very ugly and wasn't actually too informative - so I axed it.


- Afshin Mokhtari
