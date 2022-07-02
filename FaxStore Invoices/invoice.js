const invoiceConfig = {
  domain: "https://domain.ext", // NO TRAILING SLASH
  apiSecret: "YOUR_API_SECRET",
};

const axios = require("axios");
exports.run = async function (client, con, interaction, data, language) {
  await con.query(
    `SELECT * FROM perms WHERE guildid="${interaction.guild.id}" AND permtype="admin"`,
    async (err, row) => {
      if (err) throw err;
      if (!row[0]) {
        return interaction
          .reply({ content: language.noPermissions, ephemeral: true })
          .catch(function (e) {
            if (client?.config?.debugmode) console.log(e);
          });
      }
      let granted = 0;
      await row.forEach(async (r) => {
        if (interaction.member.roles.cache.has(r.roleid)) {
          granted = 1;
        }
      });
      if (granted == 0) {
        return interaction
          .reply({ content: language.missingPermissions, ephemeral: true })
          .catch(function (e) {
            if (client?.config?.debugmode) console.log(e);
          });
      }
      const user = await interaction.options.getString("userid");
      const title = await interaction.options.getString("title");
      const price = await interaction.options.getString("price");
      const description = await interaction.options.getString("description");
      const body = {
        user,
        title,
        price,
        description,
        username: interaction.user.tag,
        secret: invoiceConfig.apiSecret,
      };
      const genInvoice = await axios.post(
        `${invoiceConfig.domain}/extensions/invoiceApi/create`,
        body
      );
      const embed = new client.discord.MessageEmbed()
        .setColor(data.themecolor || "#FFFFFF")
        .setDescription(
          `${genInvoice.data || "Successfully generated invoice."}`
        );
      await interaction
        .reply({ embeds: [embed], ephemeral: true })
        .catch((e) => {});
    }
  );
};

exports.info = {
  name: "invoice",
  description: "Generate an invoice to a user via FaxStore V2.",
  options: [
    {
      name: "userid",
      description: "The user Id to send the invoice too.",
      required: true,
      type: "STRING",
    },
    {
      name: "title",
      description: "The title of the invoice (product name).",
      required: true,
      type: "STRING",
    },
    {
      name: "price",
      description:
        "The amount that should be paid in the invoice (10, 15, 25, etc).",
      required: true,
      type: "STRING",
    },
    {
      name: "description",
      description:
        "A brief description of the product you are creating the invoice for.",
      required: true,
      type: "STRING",
    },
  ],
};
