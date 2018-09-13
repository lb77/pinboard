const Discord = require("discord.js");
const client = new Discord.Client();
const pind = require("./pind.json");
const pinnedRecently = new Set();

const sql = require("sqlite");
sql.open("./database/pindb.sqlite");

var prefix="pin.";
client.login(pind.tokenboi)

client.on("ready", () => {
    var attchURL
    client.user.setActivity("with a database of pins.")
    client.guilds.forEach(guild => {
        sql.get(`SELECT * FROM guildInfo WHERE guildId = ${guild.id}`).then(info => {
            if (!info) {
                sql.run("INSERT INTO guildInfo (guildId, pingPin) VALUES (?, ?)", [guild.id, "false"])
            }
        }).catch(() => {
            console.error;
            sql.run("CREATE TABLE IF NOT EXISTS guildInfo (guildId INTEGER, pingPin TEXT)").then(() => {
                sql.run("INSERT INTO guildInfo (guildId, pingPin) VALUES (?, ?)", [guild.id, "false"])
            })
        })
    })
});

client.on("channelPinsUpdate", channel => {

    //First, get guild info from the database
    sql.get(`SELECT * FROM guildInfo WHERE guildId = ${channel.guild.id}`).then(info => {
        if (!info) {
            sql.run("INSERT INTO guildInfo (guildId, pingPin) VALUES (?, ?)", [guild.id, "false"])
        }

        if (pinnedRecently.has(channel.id)) return;

        if (info.pingPin == "everyone") {
            var mainContent = "@everyone"
        } else if (info.pingPin == "here") {
            var mainContent = "@here"
        } else {
            var mainContent = ""
        }

        const ch = channel;
        const board = channel.guild.channels.find("name", "pinboard")
        if (channel == board) return; {
            channel.fetchPinnedMessages().then(messages => {

                const pinMsgs = messages.first()

                if (!pinMsgs) return;

                //Image handler
                if (pinMsgs.embeds[0] !== undefined) {
                    if (pinMsgs.embeds[0].thumbnail !== null) {
                        var atch = pinMsgs.embeds[0].thumbnail.proxyURL
                    } else {
                        var atch = undefined
                    }
                } else if (pinMsgs.embeds[0] == undefined) {
                    if (pinMsgs.attachments.first() !== undefined) {
                        var atch = pinMsgs.attachments.first().proxyURL
                    } else {
                        var atch = undefined
                    }
                }

                //Attachment handler
                if (pinMsgs.attachments.first() !== undefined) {
                    if (!pinMsgs.attachments.first().width) {
                        var attchURL = `[Attachment](${pinMsgs.attachments.first().url})`
                    } else {
                        var attchURL = ''
                    }
                }

                if (!board) {
                    if (channel.guild.me.hasPermission("MANAGE_CHANNELS") == false) return;
                    channel.guild.createChannel('pinboard', 'text')
                    channel.guild.channels.find("name", "pinboard").send(mainContent, {
                        embed: {
                            color: 0x123456,
                            title: `New pinned message in ${channel.name}`,
                            description: pinMsgs.content
                        },
                        image: {
                            url: atch
                        },
                        thumbnail: {
                            url: pinMsgs.author.avatarURL
                        }
                    });
                    if (ch.permissionsFor(ch.guild.me).has("MANAGE_MESSAGES") == false) return;
                    pinMsgs.unpin()
                    pinnedRecently.add(ch.id);
                    setTimeout(() => {
                        pinnedRecently.delete(ch.id);
                    }, 45000);
                } else {
                    if (board.permissionsFor(board.guild.me).has("EMBED_LINKS") == false) return;
                    if (board.permissionsFor(board.guild.me).has("SEND_MESSAGES") == false) return;
                    board.send(mainContent + `\nhttps://discordapp.com/channels/${pinMsgs.guild.id}/${pinMsgs.channel.id}/${pinMsgs.id}`, {
                        embed: {
                            color: 0x123456,
                            title: `New pinned message in ${channel.name}`,
                            description: `${pinMsgs.content}\n**${attchURL}**`,
                            image: {
                                url: atch
                            },
                            thumbnail: {
                                url: pinMsgs.author.avatarURL
                            },
                            footer: {
                                text: `Message created by ${pinMsgs.author.username} (<@${pinMsgs.author.id}>)`
                            }
                        }
                    })
                    if (ch.permissionsFor(ch.guild.me).has("MANAGE_MESSAGES") == false) return;
                    pinMsgs.unpin()
                    pinnedRecently.add(ch.id);
                    setTimeout(() => {
                        pinnedRecently.delete(ch.id);
                    }, 45000);
                }

                if (ch.guild.id !== pind.testServer) return;
                channel.send("New pinned message with content\n" + pinMsgs.content)

            })
        }
    })
})




client.on("message", (message) => {
    if (message.author.bot) return;
    if (message.channel.type == 'dm') return;

    const args = message.content.split(" ").slice(1);
	
	/* Help Command */
	if (message.content.toLowerCase() == prefix + "help") {
		return message.channel.send("**Pinboard Help**", {
            embed: {
                color: 0x123456,
                description: "**Prefix: `"+prefix+"`**\n\n`info` - Uhhhh stuff, I guess?\n`check` - Is Pinboard ready to go?\n`board` - Create any channels for mirroring that don't exist already.\n`setup` - Need help setting up Pinboard?\n`git` - A link to the GitHub repo!\n\n**__Database Commands__**\n`dbstats` - View the info of your guild in the database!\n`setping` - Want Pinboard to ping with every pin?"
            }
        })
    }

	/* General Info */
    if (message.content.toLowerCase() == (prefix + "info")) {
		return message.channel.send("<:pinboard:381044242266456064> Pinboard\n```\nEver wanted to go past discord's pin limit? Are you known for pinning just too much? Well, worry no longer! Pinboard will take care of it for you!\n-=Techie Stuff=-\nLib: discord.js\nRunning on node v8\nHosted on glitch.com\n```\nPinboard requires the Manage Messages, Send Messages, and Embed Links permissions.\n`Pinboard, originally made by SmartiePlays#543`\nGitHub: https://github.com/lb77/pinboard")
    }
    
	/* Create invite link */
    if (message.content.toLowerCase() == (prefix+"invite")) {
		return message.channel.send(`Invite me to your server with this link!\nhttps://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=289808`)
    }

	/* Setup info */
	/* TODO: Create a new guide, current one is outdated */
    if (message.content.toLowerCase() == (prefix+"setup")) {
		return message.channel.send("Need help setting me up? Have I got a guide for you!\nhttps://github.com/SmartieYT/pinboard/blob/master/setup.md")
    }
	
	/* Stop the bot */
    if (message.content == prefix + "stop") {
        if (message.author.id !== "374245143655612428") return;
        process.exit()
    }

	/* Check if all channels are properly set up */
    if (message.content.toLowerCase() == prefix + "check") {
		// Permission checks
        if (message.channel.permissionsFor(message.guild.me).has("MANAGE_MESSAGES") == false)
			return message.channel.send("I do not have the manage messages permission for this guild! Please contact a server admin.");

        if (boardCh.permissionsFor(message.guild.me).has("SEND_MESSAGES") == false)
			return message.channel.send("Check failed! I do not have the send messages permission in the pinboard channel!");

        if (message.guild.me.hasPermission("EMBED_LINKS") == false)
			return message.channel.send("I do not have the embed links permission for this guild! Please contact a server admin.");
		
		// Loop through each pair of linked channels
		sql.get(`SELECT channelFrom,channelTo FROM channelPairs WHERE guildId = ${message.guild.id}`).then((pairs) => {	
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
			})
		})
	}
	
	/* Create all channels passed in as text channels */
    if (message.content.toLowerCase() == prefix + "create") {
		// Permission checks
		if (message.guild.me.hasPermission("MANAGE_CHANNELS", true, true, true) == false)
			return message.reply("I do not have the manage channels permission! Please contact a server admin.");

		if (message.member.hasPermission("MANAGE_CHANNELS", true, true, true) == false)
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
	}

	/* Set ping preference on new pin */
    if (message.content.toLowerCase().startsWith(prefix+"setping")) {
		// Permission checks
        if (message.member.hasPermission("MANAGE_GUILD", true, true, true) == false)
			return message.reply("no");
		
		// Set ping preference to given option
		var pingOptions = ["everyone", "here", "none"];
		if (pingOptions.indexOf(args[0]) < 0)
			return message.send("Usage: `" + prefix + "setping <everyone|here|none>`");

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
    }

    if (message.content.toLowerCase().startsWith(prefix+"dbstats")) {
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
            })
        })
    }

})
