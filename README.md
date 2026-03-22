# Visual Subnet

A visual, interactive subnet calculator for IPv4 and IPv6.

**[visual-subnet.andr3w.sh](https://andrewjamesmoore.github.io/visual-subnet/)**

---

![Visual Subnet screenshot](images/screenshot.png)

Most subnet calculators give you a table of numbers. Visual Subnet shows you what's actually happening — how bits are divided between the network and host portions, where your address sits in the block, and what all the related values mean at a glance.

## Features

### IPv4 Calculator
Enter any IP address and prefix length to instantly see:
- Network address, broadcast address, subnet mask, and wildcard mask
- First and last usable hosts
- Total addresses and usable host count
- IP class
- A visual bit-allocation bar showing the network/host split
- Full binary representation of the address and mask

You can also enter a parent prefix to see how many subnets you're carving out of a larger block.

### IPv6 Calculator
The same visual approach applied to IPv6 — enter an address and prefix to see the prefix/interface ID split, address details, and binary breakdown.

### 7-Second Subnetting Method
An interactive guide to the mental math shortcut used for quickly calculating subnet boundaries without converting to binary — popularised by Professor Messer for networking exams and certifications. Enter an IP and prefix to see a step-by-step walkthrough alongside the full reference chart.

---

[github.com/andrewjamesmoore/visual-subnet](https://github.com/andrewjamesmoore/visual-subnet)
