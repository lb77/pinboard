const Discord = require("discord.js");
const client = new Discord.Client();
const pind = require("./pind.json");
const sql = require("sqlite");

const prefix="pin.";

sql.open("./database/pindb.sqlite");
client.login(pind.tokenboi)

var commandHandlers = {
	/* Help Command */
	"help": ((message, args) => {
		return message.channel.send("**Pinboard Help**", {
			embed: {
				color: 0x123456,
				description: "**Prefix: `"+prefix+"`**\n\n`info` - Uhhhh stuff, I guess?\n`check` - Is Pinboard ready to go?\n`board` - Create any channels for mirroring that don't exist already.\n`setup` - Need help setting up Pinboard?\n`git` - A link to the GitHub repo!\n\n**__Database Commands__**\n`dbstats` - View the info of your guild in the database!\n`setping` - Want Pinboard to ping with every pin?"
			}
		});
	}),

	/* General Info */
	"info": ((message, args) => {
		return message.channel.send("<:pinboard:381044242266456064> Pinboard\n```\nEver wanted to go past discord's pin limit? Are you known for pinning just too much? Well, worry no longer! Pinboard will take care of it for you!\n-=Techie Stuff=-\nLib: discord.js\nRunning on node v8\nHosted on glitch.com\n```\nPinboard requires the Manage Messages, Send Messages, and Embed Links permissions.\n`Pinboard, originally made by SmartiePlays#543`\nGitHub: https://github.com/lb77/pinboard");
	}),

	/* Create invite link */
	"invite": ((message, args) => {
		return message.channel.send(`Invite me to your server with this link!\nhttps://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=289808`);
	}),

	/* Setup info */
	"setup": ((message, args) => {
		return message.channel.send("Need help setting me up? Have I got a guide for you!\nhttps://github.com/SmartieYT/pinboard/blob/master/setup.md");
	}),

	/* Stop the bot */
	"stop": ((message, args) => {
		if (message.author.id !== "374245143655612428") return;
		process.exit();
	}),

	/* Check if all channels are properly set up */
	"check": ((message, args) => {
		// Permission checks
		if (message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES") === false)
			return message.channel.send("I do not have the manage messages permission for this guild! Please contact a server admin.");

		if (boardCh.permissionsFor(message.guild.me).has("SEND_MESSAGES") === false)
			return message.channel.send("Check failed! I do not have the send messages permission in the pinboard channel!");

		if (message.guild.me.hasPermission("EMBED_LINKS") === false)
			return message.channel.send("I do not have the embed links permission for this guild! Please contact a server admin.");

		// Loop through each pair of linked channels
		sql.all(`SELECT channelFrom,channelTo FROM channelPairs WHERE guildId = ${message.guild.id}`).then((pairs) => {	
			if (!pairs) {
				return message.channel.send("No channels set up for pin mirroring! Run `" + prefix + "add channel1 channel2` to mirror pins from channel1 to channel2.");
			}

			var channelTo, reply = "";
			pairs.forEach((pair) => {
				reply += channelFrom + " -> " + pair.channelTo;
				channelTo = message.guild.channels.find("name", pair.channelTo);
				channelFrom = message.guild.channels.find("name", pair.channelFrom);

				if (!channelTo) {
					reply += ": Missing "
					if (!channelFrom) {
						reply += pair.channelFrom + ", ";
					}
					reply += pair.channelTo;
				} else if (!channelFrom) {
					reply += ": Missing "
					if (!channelTo) {
						reply += pair.channelTo + ", ";
					}
					reply += pair.channelFrom;
				}

				reply += "\n";
			});

			// If some channels don't exist, notify of it
			if (reply.indexOf("Missing") >= 0) {
				reply += "\nCheck failed. Please fix the missing channels.\n";
				reply += "You can run the `" + prefix + "create` command to automatically create channels, or update the mirrors list by running the `" + prefix + "delete` and `" + prefix + "add` commands.";
			} else {
				reply += "\nCheck passed. I'm ready to start! :wave:";
			}

			return message.channel.send(reply);
		}).catch(() => {
			console.error;
			sql.run("CREATE TABLE IF NOT EXISTS channelPairs (guildId INTEGER, channelFrom TEXT, channelTo Text)").then(() => {
				return message.channel.send("No channels set up for pin mirroring! Run `" + prefix + "add channel1 channel2` to mirror pins from channel1 to channel2.");
			});
		});
	}),

	/* Create all channels passed in as text channels */
	"create": ((message, args) => {
		// Permission checks
		if (message.guild.me.hasPermission("MANAGE_CHANNELS", true, true, true) === false)
			return message.reply("I do not have the manage channels permission! Please contact a server admin.");

		if (message.member.hasPermission("MANAGE_CHANNELS", true, true, true) === false)
			return message.reply("You do not have the manage channels permission!");

		// Loop through args (if any), create channel/notify of existence for each
		if (args.length > 0)
			return message.channel.send(`Usage: \`${prefix}.create channel1 [channel2 ... channelN]\``);

		var createdChannels = [], existingChannels = [], msg = "";
		args.forEach((arg, i) => {
			channelToCreate = message.guild.channels.find("name", channel);

			if (!channelToCreate) {
				message.guild.createChannel(arg, 'text').then(channel => createdChannels.push(channel.id));
			} else {
				existingChannels.push(channelToCreate.id);
			}
		});

		if (createdChannels.length > 0)
			reply += "Created channels: <#" + createdChannels.join(">, <#") + ">\n";
		if (existingChannels.length > 0)
			reply += "The following channels already exist: <#" + existingChannels.join(">, <#") + ">";

		return message.channel.send(reply);
	}),

	"add": ((message, args) => {
		if (message.guild.me.hasPermission("MANAGE_CHANNELS", true, true, true) === false)
			return message.reply("I do not have the manage channels permission! Please contact a server admin.");

		if (message.member.hasPermission("MANAGE_CHANNELS", true, true, true) === false)
			return message.reply("You do not have the manage channels permission!");

		if (args.length < 2)
			return message.channel.send(`Usage: \`${prefix}.add channel1 channel2 [timeout pingOption]\``);

		var pinTimeout = 0, pingPin = "none";
	
		// Optional params are 1) timeout between pins, and 2) who to ping on pin
		if (args[2]) pinTimeout = parseInt(args[2], 10) || 0;
		if (args[3]) pingPin = args[3];

		sql.get(`SELECT * FROM channelPairs WHERE guildId = ${message.guild.id} AND channelFrom = ${args[0]} AND channelTo = ${args[1]}`).then((info) => {
			if (info)
				return message.channel.send("Pin mirroring already set up for these channels!");

			return sql.get(`SELECT COUNT(*) AS numPairs FROM channelPairs WHERE guildId = ${message.guild.id} GROUP BY guildId`);
		}).then((info) => {
			sql.run(`INSERT INTO channelPairs (id, guildId, channelFrom, channelTo, pinTimeout, pingPin) VALUES (${info.numPairs}, ${message.guild.id}, ${args[0]}, ${args[1]}, ${pinTimeout}, ${pingPin})`);

			return message.channel.send(`Pins in #${args[0]} will now be mirrored to #${args[1]}.`);
		});
	}),

	"edit": ((message, args) => {
		var rows = await sql.all(`SELECT *, COUNT(*) AS numPairs FROM channelPairs WHERE guildId = ${message.guild.id} GROUP BY guildId`);

		var channelStr = "";
		rows.forEach((row) => {
			channelStr += `${row.id}. ${row.channelFrom} -> ${row.channelTo}\n`;
		});
		channelStr += `\nPlease choose a pair to edit (1-${row.numPairs}):`;

		message.channel.send(channelStr);
		
		var regex = /^[0-9]+$/;
		const filter = m => regex.test(m);
		message.channel.awaitMessages(filter, {maxMatches: 1, time: 30000, errors: ['time']})
			.catch(() => {
				message.channel.send("Command timed out.");
			}).then((collected) => {
				const choice = collected.first();

				// TODO: Finish pair editing functionality
				// 1 - Set pin timeout
				// 2 - Set ping preference
				// 3 - Delete
				message.channel.send(`1. Set pin timeout`);
			});
	});

	/* Set ping preference on new pin */
	"setping": ((message, args) => {
		// Permission checks
		if (message.member.hasPermission("MANAGE_GUILD", true, true, true) === false)
			return message.reply("no");

		// Set ping preference to given option
		var pingOptions = ["everyone", "here", "none"];
		if (pingOptions.indexOf(args[0]) < 0)
			return message.reply("Usage: `" + prefix + "setping <everyone|here|none>`");

		sql.get(`SELECT * FROM guildInfo WHERE guildId = ${message.guild.id}`).then((info) => {
			if (!info) {
				sql.run("INSERT INTO guildInfo (guildId, pingPin) VALUES (?, ?)", [message.guild.id, args[0]]);
			} else {
				sql.run(`UPDATE guildInfo SET pingPin = args[0] WHERE guildId = ${message.guild.id}`);
			}

			return message.reply("Pinboard will now ping " + args[0] + " on each pin");
		}).catch((err) => {
			console.log(err);
		});
	}),

	"dbstats": ((message, args) => {
		message.channel.send("Fetching your info! This may take a while...").then(msg => {
			//This part is copy-pasted from above, more or less
			sql.get(`SELECT * FROM guildInfo WHERE guildId = ${message.guild.id}`).then(info => {
				if (!info) {
					sql.run("INSERT INTO guildInfo (guildId, pingPin) VALUES (?, ?)", [message.guild.id, "false"])
				}
				msg.edit("**Database Stats**", {
					embed: {
						color: 0x123456,
						title: `DB info for ${message.guild.name}`,
						description: `Ping with every pin?\n**${info.pingPin}**`
					}
				})
			});
		});
	})
}

exports.commandHandlers = commandHandlers;
