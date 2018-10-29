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

client.on("channelPinsUpdate", (channel) => {
	if (pinnedRecently.has(channel.id) return;

	channel.fetchPinnedMessages()
	.then((messages) => { 
		var pinMsg = messages.first();
		if (!pinMsg) return;

		return sql.get(`SELECT * FROM channelPairs WHERE guildId = ${channel.guild.id}`);
	}).then((pairs) => {
		if (!pairs) return;

		pairs.forEach((row) => {
			// Check if mirror channel exists + we have perms to send there
			var mirror = channel.guild.channels.find("name", row.channelTo);
			if (!mirror) {
				channel.send("Could not mirror to #" + row.channelTo + " -- doesn't exist!");
				return;
			}

			var perms = mirror.permissionsFor(mirror.guild.me);
			if (!perms.has("EMBED_LINKS") || !perms.has("SEND_MESSAGES")) {
				channel.send("Could not mirror to #" + row.channelTo + " -- insufficient permissions!");
				return;
			}

			if (row.pingPin === "everyone") {
				var mainContent = "@everyone";
			} else if (row.pingPin === "here") {
				var mainContent = "@here";
			} else {
				var mainContent = "";
			}

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
					attchURL = `[Attachment](${pinMsgs.attachments.first().url})`;
				}
			}

			mirror.send(mainContent + `\nhttps://discordapp.com/channels/${pinMsgs.guild.id}/${pinMsgs.channel.id}/${pinMsgs.id}`, {
				embed: {
					color: 0x123456,
						title: `New pinned message in ${channel.name}`,
						description: `${pinMsgs.content}\n**${attchURL}**`,
						image: {
							url: imgThumb
						},
						thumbnail: {
							url: pinMsgs.author.avatarURL
						},
						footer: {
							text: `Message created by ${pinMsgs.author.username} (<@${pinMsgs.author.id}>)`
						}
				}
			});

			if (channel.permissionsFor(channel.guild.me).has("MANAGE_MESSAGES") === false) return;

			pinMsgs.unpin();
			pinMsgs.react("📌");

			pinnedRecently.add(channel.id);
			setTimeout(() => {
				pinnedRecently.delete(channel.id);
			}, row.pinTimeout);

	});
});


		// First, get all channel pairs from the database
		sql.get(`SELECT * FROM channelPairs WHERE guildId = ${channel.guild.id}`).then((info) => {
			if (!info) return;

			info.forEach((row) => {
			});
		});

	// TODO: Fetch pins first, THEN loop through channel pairs
	if (channel.guild.id !== pind.testServer) return;
	channel.send("New pinned message with content\n" + pinMsgs.content);
});
}




client.on("message", (message) => {
	if (message.author.bot) return;
	if (message.channel.type === 'dm') return;

	const args = message.content.split(" ");

	if (args[0].indexOf(prefix) === 0) {
		const command = String(args[0]).substring(prefix.length).toLowerCase();

		if (commandHandlers[command]) {
			console.log("Received command from " + message.author.name + ": " + message.content);
			commandHandlers[command](args);
		}
	}
})
