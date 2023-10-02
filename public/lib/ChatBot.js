export class ChatBot {

constructor(){
    this.chatMessages = document.querySelector("#chatDiv");
    this.instructDoc = '' ;
};

async addImage(imageBlob) {
  const imgElement = document.createElement('img');
  imgElement.src = URL.createObjectURL(imageBlob);

  // Wait for the image to load
  await new Promise(resolve => {
    imgElement.onload = resolve;
  });
      // Style for horizontal centering
      imgElement.style.display = 'block';  // Block display to occupy full width
      imgElement.style.marginLeft = 'auto';  // Automatic left margin
      imgElement.style.marginRight = 'auto';  // Automatic right margin
  this.chatMessages.appendChild(imgElement);  
  this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

  this.addText('bot', "mockup response")
}

addText(sender, queryText) {
  console.log('mdRes ',queryText)
  const emoji = "👌"
  let containerElement;
  
const uml =
`
mockup response...

inpsection result: xxx
confidence: XX %
`
queryText = uml
    containerElement =  document.createElement("div");
    containerElement.innerHTML = "";
    containerElement.className = "talk-bubble tri-right left-in"; // Added this line

  const talkText = document.createElement("div"); // Added this line
  talkText.className = "talktext"; // Added this line
  talkText.innerHTML = `<span class="emoji-styling">${emoji}</span>`;
  containerElement.appendChild(talkText); // Added this line

  const parsedContent = this.commitParser(queryText)
  const chatMessage = this.markupChatMessage(parsedContent)
  containerElement.appendChild(chatMessage)

  this.chatMessages.appendChild(containerElement);
  this.chatMessages.appendChild(document.createElement("br"));
  this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

}
commitParser(content) {
  const results = [];
  const sections = content.split('==== END DIAGRAM ====').map(s => s.trim());

  sections.forEach(section => {
      if (section.includes('==== BEGIN DIAGRAM ====')) {
          const diagramContent = section.split('==== BEGIN DIAGRAM ====').pop().trim();
          results.push({ type: 'diagram', content: diagramContent });
          
          const textContentBeforeDiagram = section.split('==== BEGIN DIAGRAM ====').shift().trim();
          if (textContentBeforeDiagram) {
              results.unshift({ type: 'text', content: textContentBeforeDiagram });
          }
      } else if (section) {
          results.push({ type: 'text', content: section });
      }
  });

  return results;
}


markupChatMessage(parsedContent) {
  const chatContainer = document.createElement('div');

  parsedContent.forEach(item => {
      const element = document.createElement(item.type === 'text' ? 'div' : 'canvas');
      if (item.type === 'text') {
          element.innerText = item.content;
      } else {
          element.style.display = "block";  // Set canvas to block
          element.style.margin = "auto";    // Center it horizontally
          nomnoml.draw(element, item.content);
      }
      chatContainer.appendChild(element);
  });

  return chatContainer;
}




}