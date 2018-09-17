const Discord = require("discord.js");
const client = new Discord.Client();
const pind = require("./pind.json");
const sql = require("sqlite");
const pinnedRecently = new Set();

const prefix="pin.";

sql.open("./database/pindb.sqlite");
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
	var mainContent;
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
	});
	
	// TODO: Figure out how to embed nicely (multiple not supported by discord.js, twitter doesn't work)
	// Also need to just generally simplify this
	sql.get(`SELECT * FROM channelPairs WHERE guildId = $(channel.guild.id}`).then((info) => {
		if (!info) return;

		channel.fetchPinnedMessages().then((messages) => {
			const pinMsgs = messages.first()
			if (!pinMsgs) return;

			// Image handler
			const thumbs = [];
			if (pinMsgs.embeds[0] !== undefined) {
				pinMsgs.embeds.forEach((embed) => {
					if (embed.thumbnail !== null) {
						thumbs.push(embed.thumbnail.proxyURL);
					}
				});
			} else if (pinMsgs.embeds[0] == undefined) {
				if (pinMsgs.attachments.first() !== undefined) {
					pinMsgs.attachments.first().forEach((atch) => {
						thumbs.push(atch.proxyURL);
					});
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

			info.forEach((row) => {
				const channelTo = channel.guild.channels.find("name", row.channelTo);
				if (channelTo === channel) return;
			});
	});
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

		const args = message.content.split(" ");

		if (args[0].indexOf(prefix) === 0) {
			const command = String(args[0]).substring(prefix.length).toLowerCase();

			if (commandHandlers[command]) {
				console.log("Received command from " + message.author.name + ": " + message.content);
				commandHandlers[command](args);
			}
		}
	})
