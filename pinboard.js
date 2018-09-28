const Discord = require("discord.js");
const client = new Discord.Client();
const pind = require("./pind.json");
const sql = require("sqlite");
const pinnedRecently = new Set();

const prefix="pin.";

sql.open("./database/pindb.sqlite");
client.login(pind.tokenboi)

client.on("ready", () => {
    client.user.setActivity("with a database of pins.")
});

client.on("channelPinsUpdate", channel => {
    // First, get guild info from the database
	var mainContent;
    sql.get(`SELECT * FROM channelPairs WHERE guildId = ${channel.guild.id}`).then((info) => {
        if (!info) return;

		info.forEach((row) => {
			mirrorExists = channel.guild.channels.find("name", row.channelTo);
			if (!mirrorExists) return;

			var mainContent = ""
			if (i.pingPin == "everyone") {
				var mainContent = "@everyone"
			} else if (info.pingPin == "here") {
				var mainContent = "@here"
			}

			channel.fetchPinnedMessages().then((messages) => {
				const pinMsgs = messages.first()
				if (!pinMsgs) return;

				// Image preview handler
				var imgThumb = undefined;
				if (pinMsgs.embeds[0] !== undefined) {
					// Image is in embed
					if (pinMsgs.embeds[0].thumbnail !== null) {
						imgThumb = pinMsgs.embeds[0].thumbnail.proxyURL;
					} else if (pinMsgs.embeds[0].image !== null) {
						imgThumb = pinMsgs.embeds[0].image.proxyURL;
					}
				} else {
					// Image is an attachment
					if (pinMsgs.attachments.first() !== undefined) {
						imgThumb = pinMsgs.attachments.first().proxyURL;
					}
				}

				// Non-image attachment handler
				var attachURL = '';
				if (pinMsgs.attachments.first() !== undefined) {
					if (!pinMsgs.attachments.first().width) {
						attchURL = `[Attachment](${pinMsgs.attachments.first().url})`
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
					});
					
					if (ch.permissionsFor(ch.guild.me).has("MANAGE_MESSAGES") == false) return;
					
					pinMsgs.unpin()
					pinnedRecently.add(ch.id);
					setTimeout(() => {
						pinnedRecently.delete(ch.id);
					}, 45000);
				}

				if (ch.guild.id !== pind.testServer) return;
				channel.send("New pinned message with content\n" + pinMsgs.content)
			});
		});
	});
}




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
