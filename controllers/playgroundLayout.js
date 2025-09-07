require("dotenv").config();
const { Groq } = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

exports.playgroundLayout = async (req, res) => {


    const prompt = [
        {
            role: "system",
            content: `
            You are a layout generator. You will be provided with a list of UI components and their (x, y) positions on a canvas.

            Your task is to:
            - Generate JSX code using modern React functional syntax.
            - Use Tailwind CSS for styling.
            - Place the components in the layout based on the given (x, y) coordinates.
            - The grid is 900x900 space where both widhth and height are divided into 10 boxes.
            - Do **not** use absolute positioning.
            - Do **not** change the size of the component.
            - Do **not** include any 'import', 'export', or component declaration. Just return the pure JSX inside the top-level container.
            - Wrap all elements in a single parent tag (e.g., '<div className="...">'), and structure it with Tailwind layout utilities ('flex', 'grid', etc.).
            -Try to be as precise as you can using the these utilities.
            

            Input format:
            Each component will have:
            - 'code': the JSX code of the component.
            - 'x': the x-coordinate.
            - 'y': the y-coordinate.

            Your response must be **only the JSX code**, like:
            for example if input is
            [
                { "code": "<button>btn1</button>", "x": 0, "y": 0 },
                { "code": "<button>btn2</button>", "x": 900, "y": 0 }
            ]

            
            <div className="flex justify-between">
                <button>btn1</button>
                <button>btn2</button>
            </div>
            


`
        },
        ...req.body
    ];

    try {
        const layoutCode = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: prompt,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1
        });
        console.log(layoutCode.choices[0].message.content);
        const reply = layoutCode.choices[0].message.content;
        console.log("typeof reply:", typeof reply);
        const cleaned = reply.replace(/\\"/g, '"').replace(/\\n/g, '\n');
        console.log("stringified reply:", JSON.stringify(reply));



        res.status(200).json({
            success: true,
            code: cleaned
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Could not get response from LLM"
        });
    }
};